import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, promises as fs } from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { driverName, uploadDir } from '@/lib/storage';

/**
 * Serves files written by the "local" storage driver.
 *
 * Uploads are kept outside public/ on purpose — a deploy that replaces the
 * application directory must not take customer images with it — and Next only
 * serves public/ statically, so they are streamed from here instead.
 *
 * In production the same directory can be served directly by the web server,
 * which is faster and keeps image traffic off the Node process entirely:
 *
 *   location /media/ { alias /home/<user>/stonesland-uploads/; }
 *
 * That takes precedence over this route when configured. This route exists so
 * the application is correct without it.
 */

export const dynamic = 'force-dynamic';

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
};

export async function GET(
  _request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  if (driverName() !== 'local') {
    // Files live with the remote provider; their URLs point there directly.
    return new NextResponse('Not found', { status: 404 });
  }

  const segments = params.path || [];
  if (
    segments.length === 0 ||
    segments.some((s) => !s || s === '.' || s === '..' || s.includes('\\') || s.includes('\0'))
  ) {
    return new NextResponse('Not found', { status: 404 });
  }

  const root = uploadDir();
  const filePath = path.join(root, ...segments);

  // Resolved path must remain inside the upload root even after symlinks and
  // any normalisation the join performed.
  if (filePath !== path.normalize(filePath) || !filePath.startsWith(root + path.sep)) {
    return new NextResponse('Not found', { status: 404 });
  }

  let stat;
  try {
    stat = await fs.stat(filePath);
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
  if (!stat.isFile()) {
    return new NextResponse('Not found', { status: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';

  const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;

  return new NextResponse(stream, {
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(stat.size),
      // Keys are content hashes, so a given URL's bytes never change.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
