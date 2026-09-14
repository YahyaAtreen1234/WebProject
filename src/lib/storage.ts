import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Storage abstraction for uploaded media.
 *
 * Uploads previously took two unrelated paths. /api/upload wrote to Vercel
 * Blob, which ties the deployment to one host and which nothing in the UI ever
 * called. /api/admin/upload — the path the admin interface actually uses —
 * base64-encoded the file and returned a data: URL that was written straight
 * into the database. That works on any host, but it inflates every image by a
 * third, embeds it in every API response that touches the row, and defeats
 * browser and CDN caching entirely.
 *
 * Both now go through a driver chosen by STORAGE_DRIVER:
 *
 *   local        files on disk, served by /media/*        (default)
 *   s3           any S3-compatible endpoint (R2, B2, MinIO, AWS)
 *   vercel-blob  the previous behaviour, for Vercel deploys
 *
 * The s3 and vercel-blob drivers import their SDKs dynamically, so neither
 * package needs to be installed unless that driver is selected.
 *
 * Existing data: rows already holding data: URLs keep working untouched.
 * isInlineDataUrl() identifies them so callers never try to delete a key that
 * was never a file.
 */

export interface StoredFile {
  /** Public URL to render. */
  url: string;
  /** Opaque handle for deletion. Empty for inline data URLs. */
  key: string;
  size: number;
  contentType: string;
}

export interface StorageDriver {
  put(key: string, data: Buffer, contentType: string): Promise<StoredFile>;
  delete(key: string): Promise<void>;
}

export class StorageError extends Error {
  constructor(message: string, readonly status = 500) {
    super(message);
    this.name = 'StorageError';
  }
}

// ---------------------------------------------------------------- config ---

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export function maxUploadBytes(): number {
  const raw = process.env.MAX_UPLOAD_BYTES;
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_BYTES;
}

/** Public path prefix the local driver's files are served under. */
function mediaBasePath(): string {
  const raw = process.env.MEDIA_BASE_PATH || '/media';
  return raw.startsWith('/') ? raw.replace(/\/+$/, '') : `/${raw.replace(/\/+$/, '')}`;
}

/**
 * Where the local driver writes.
 *
 * Deliberately defaults outside public/ and outside .next/: a deploy that
 * replaces the application directory would otherwise delete every image a
 * customer has uploaded. On a host where the release directory is replaced on
 * each deploy, point UPLOAD_DIR at a path that is not part of the release.
 */
export function uploadDir(): string {
  return process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.resolve(process.cwd(), 'uploads');
}

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
]);

const EXTENSION_BY_TYPE: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
  'image/svg+xml': '.svg',
};

export function assertAllowedImage(contentType: string, size: number): void {
  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    throw new StorageError(
      `Unsupported image type "${contentType}". Allowed: ${[...ALLOWED_IMAGE_TYPES].join(', ')}.`,
      415
    );
  }
  const limit = maxUploadBytes();
  if (size > limit) {
    throw new StorageError(
      `Image is ${(size / 1024 / 1024).toFixed(1)} MB; the limit is ${(limit / 1024 / 1024).toFixed(1)} MB.`,
      413
    );
  }
}

/** True for the base64 data: URLs written by the previous implementation. */
export function isInlineDataUrl(url: string): boolean {
  return typeof url === 'string' && url.startsWith('data:');
}

/**
 * Build a collision-free key. Content-hashed so re-uploading the same file
 * does not accumulate duplicates, date-partitioned so directories stay small.
 */
export function buildKey(originalName: string, contentType: string, data: Buffer): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const hash = createHash('sha256').update(data).digest('hex').slice(0, 16);

  const fromName = path.extname(originalName).toLowerCase();
  const ext = EXTENSION_BY_TYPE[contentType] || (/^\.[a-z0-9]{2,5}$/.test(fromName) ? fromName : '.bin');

  return `products/${yyyy}/${mm}/${hash}${ext}`;
}

/** Reject traversal and absolute paths before a key ever reaches the filesystem. */
export function assertSafeKey(key: string): void {
  if (
    !key ||
    key.startsWith('/') ||
    key.includes('\\') ||
    key.split('/').some((seg) => seg === '..' || seg === '.' || seg === '')
  ) {
    throw new StorageError('Invalid storage key.', 400);
  }
}

// --------------------------------------------------------------- drivers ---

const localDriver: StorageDriver = {
  async put(key, data, contentType) {
    assertSafeKey(key);
    const root = uploadDir();
    const dest = path.join(root, key);

    // Belt and braces: confirm the resolved path is still inside the root.
    if (!dest.startsWith(root + path.sep)) {
      throw new StorageError('Resolved path escaped the upload directory.', 400);
    }

    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, data);

    return { url: `${mediaBasePath()}/${key}`, key, size: data.length, contentType };
  },

  async delete(key) {
    assertSafeKey(key);
    const dest = path.join(uploadDir(), key);
    try {
      await fs.unlink(dest);
    } catch (err: any) {
      // Already gone is the desired end state, not a failure.
      if (err?.code !== 'ENOENT') throw err;
    }
  },
};

const s3Driver: StorageDriver = {
  async put(key, data, contentType) {
    assertSafeKey(key);
    const { sdk, client, bucket, publicBase } = await s3Config();

    await client.send(
      new sdk.PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    return { url: `${publicBase}/${key}`, key, size: data.length, contentType };
  },

  async delete(key) {
    assertSafeKey(key);
    const { sdk, client, bucket } = await s3Config();
    await client.send(new sdk.DeleteObjectCommand({ Bucket: bucket, Key: key }));
  },
};

/**
 * The AWS SDK is an optional peer: it is only needed when STORAGE_DRIVER is
 * "s3". The specifier is held in a variable so TypeScript does not try to
 * resolve the package at compile time, which would make an optional driver a
 * hard build dependency for every deployment that does not use it.
 */
const S3_SDK_MODULE = '@aws-sdk/client-s3';

async function s3Config() {
  let sdk: any;
  try {
    sdk = await import(/* webpackIgnore: true */ S3_SDK_MODULE);
  } catch {
    throw new StorageError(
      `STORAGE_DRIVER is "s3" but ${S3_SDK_MODULE} is not installed. Run: npm install ${S3_SDK_MODULE}`,
      500
    );
  }

  const bucket = required('S3_BUCKET');
  const region = process.env.S3_REGION || 'auto';
  const endpoint = process.env.S3_ENDPOINT || undefined;
  const publicBase = (process.env.S3_PUBLIC_BASE_URL || '').replace(/\/+$/, '');

  if (!publicBase) {
    throw new StorageError('S3_PUBLIC_BASE_URL must be set so stored files have a public URL.', 500);
  }

  const client = new sdk.S3Client({
    region,
    endpoint,
    // Required by R2/MinIO and harmless on AWS when a custom endpoint is set.
    forcePathStyle: Boolean(endpoint),
    credentials: {
      accessKeyId: required('S3_ACCESS_KEY_ID'),
      secretAccessKey: required('S3_SECRET_ACCESS_KEY'),
    },
  });

  return { sdk, client, bucket, publicBase };
}

const vercelBlobDriver: StorageDriver = {
  async put(key, data, contentType) {
    assertSafeKey(key);
    let mod: typeof import('@vercel/blob');
    try {
      mod = await import('@vercel/blob');
    } catch {
      throw new StorageError(
        'STORAGE_DRIVER is "vercel-blob" but @vercel/blob is not installed.',
        500
      );
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new StorageError(
        'STORAGE_DRIVER is "vercel-blob" but BLOB_READ_WRITE_TOKEN is not set.',
        500
      );
    }

    const blob = await mod.put(key, data, {
      access: 'public',
      addRandomSuffix: false,
      contentType,
    });

    return { url: blob.url, key: blob.url, size: data.length, contentType };
  },

  async delete(key) {
    const mod = await import('@vercel/blob');
    await mod.del(key);
  },
};

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new StorageError(`${name} is required for STORAGE_DRIVER "s3".`, 500);
  return value;
}

// ------------------------------------------------------------------- api ---

export function driverName(): 'local' | 's3' | 'vercel-blob' {
  const raw = (process.env.STORAGE_DRIVER || 'local').toLowerCase();
  if (raw === 's3' || raw === 'vercel-blob' || raw === 'local') return raw;
  throw new StorageError(
    `Unknown STORAGE_DRIVER "${raw}". Expected "local", "s3" or "vercel-blob".`,
    500
  );
}

function driver(): StorageDriver {
  switch (driverName()) {
    case 's3':
      return s3Driver;
    case 'vercel-blob':
      return vercelBlobDriver;
    default:
      return localDriver;
  }
}

/** Validate, key and store an uploaded file. */
export async function storeUpload(file: {
  name: string;
  type: string;
  data: Buffer;
}): Promise<StoredFile> {
  assertAllowedImage(file.type, file.data.length);
  const key = buildKey(file.name, file.type, file.data);
  return driver().put(key, file.data, file.type);
}

/** Remove a stored file. Inline data: URLs are a no-op — there is no file. */
export async function removeUpload(urlOrKey: string): Promise<void> {
  if (!urlOrKey || isInlineDataUrl(urlOrKey)) return;

  const base = mediaBasePath();
  const key = urlOrKey.startsWith(`${base}/`) ? urlOrKey.slice(base.length + 1) : urlOrKey;

  await driver().delete(key);
}
