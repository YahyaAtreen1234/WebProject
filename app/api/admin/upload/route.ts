import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { StorageError, maxUploadBytes, storeUpload } from '@/lib/storage';

/**
 * POST /api/admin/upload — the endpoint the admin image picker uses.
 *
 * Three things were wrong here and are fixed together because they are one
 * problem:
 *
 * 1. Authentication was commented out behind "Skip auth for now - test if
 *    upload works", leaving an open endpoint that accepted files from anyone.
 *    ImageUploader has always sent the bearer token, so nothing in the UI
 *    changes by enforcing it again.
 *
 * 2. There was no size or type limit — the UI still says "all image formats
 *    and sizes are allowed". Every upload was read wholly into memory, so a
 *    large file was a straightforward way to exhaust the server's heap.
 *
 * 3. The file was base64-encoded into a data: URL and written into the
 *    database. That survives any host, which is presumably why it was done,
 *    but it inflates each image by roughly a third, ships it inside every API
 *    response that reads the row, and cannot be cached by a browser or CDN.
 *
 * Uploads now go to the configured storage driver and the response carries a
 * URL instead of the bytes. Rows already holding data: URLs keep rendering —
 * nothing migrates them, and nothing needs to.
 */

function verifyAdmin(request: NextRequest) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;

  try {
    const payload = jwt.verify(auth.slice(7), secret) as any;
    return payload?.isAdmin || payload?.adminId ? payload : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Reject oversized bodies before reading them into memory where possible.
  const declared = Number(request.headers.get('content-length') || 0);
  const limit = maxUploadBytes();
  if (declared && declared > limit) {
    return NextResponse.json(
      { error: `Image exceeds the ${(limit / 1024 / 1024).toFixed(0)} MB limit.` },
      { status: 413 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const data = Buffer.from(await file.arrayBuffer());
    const stored = await storeUpload({
      name: file.name || 'upload',
      type: file.type || 'application/octet-stream',
      data,
    });

    return NextResponse.json({
      url: stored.url,
      filename: file.name,
      size: stored.size,
      contentType: stored.contentType,
    });
  } catch (error) {
    if (error instanceof StorageError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
