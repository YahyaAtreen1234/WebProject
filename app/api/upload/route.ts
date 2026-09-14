import { NextRequest, NextResponse } from 'next/server';
import { withUserAuth, errorResponse, successResponse } from '@/lib/middlewares';
import { StorageError, storeUpload } from '@/lib/storage';

/**
 * POST /api/upload
 * Upload a single image. Requires authentication.
 *
 * Previously imported `put` from @vercel/blob directly, which made the route —
 * and therefore the build — depend on one hosting provider. It now uses the
 * storage adapter, so the same code runs against local disk, any S3-compatible
 * endpoint, or Vercel Blob, chosen by STORAGE_DRIVER.
 */
export async function POST(request: NextRequest) {
  const auth = await withUserAuth(request);
  if (!auth.success) return auth.response!;

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return errorResponse('No file provided', 400);
    }

    const data = Buffer.from(await file.arrayBuffer());
    const stored = await storeUpload({
      name: file.name || 'upload',
      type: file.type || 'application/octet-stream',
      data,
    });

    return successResponse(
      {
        url: stored.url,
        key: stored.key,
        filename: file.name,
        size: stored.size,
        type: stored.contentType,
      },
      201
    );
  } catch (error) {
    if (error instanceof StorageError) {
      return errorResponse(error.message, error.status);
    }
    console.error('Upload error:', error);
    return errorResponse('Failed to upload image', 500);
  }
}
