import { NextRequest } from 'next/server';
import { withUserAuth, errorResponse, successResponse } from '@/lib/middlewares';
import { StorageError, isInlineDataUrl, removeUpload } from '@/lib/storage';

/**
 * POST /api/upload/delete
 * Delete an uploaded image. Requires authentication.
 *
 * Previously called `del` from @vercel/blob. It now goes through the storage
 * adapter, so deletion works against whichever driver stored the file.
 *
 * The old handler also required the value to parse as an absolute URL, which
 * the adapter's local driver never produces — its URLs are site-relative
 * ("/media/products/..."). That check is gone.
 */
export async function POST(request: NextRequest) {
  const auth = await withUserAuth(request);
  if (!auth.success) return auth.response!;

  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return errorResponse('No URL provided', 400);
    }

    // Images stored before the adapter existed are base64 embedded in the row
    // itself. There is no file to remove; clearing the column is the caller's
    // job, and reporting failure here would be wrong.
    if (isInlineDataUrl(url)) {
      return successResponse({
        message: 'Image is stored inline; no file to delete.',
        url,
        deleted: false,
      });
    }

    await removeUpload(url);

    return successResponse({ message: 'Image deleted successfully', url, deleted: true });
  } catch (error) {
    if (error instanceof StorageError) {
      return errorResponse(error.message, error.status);
    }
    console.error('Delete error:', error);
    return errorResponse('Failed to delete image', 500);
  }
}
