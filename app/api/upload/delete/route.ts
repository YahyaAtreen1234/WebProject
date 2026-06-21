import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { withUserAuth, errorResponse, successResponse } from '@/lib/middlewares';

/**
 * POST /api/upload/delete
 * Delete an uploaded image
 * Requires authentication
 */
export async function POST(request: NextRequest) {
  const auth = await withUserAuth(request);
  if (!auth.success) return auth.response!;

  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return errorResponse('No URL provided', 400);
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return errorResponse('Invalid URL format', 400);
    }

    // Delete from Vercel Blob
    await del(url);

    return successResponse({
      message: 'Image deleted successfully',
      url,
    });
  } catch (error: any) {
    console.error('Delete error:', error);

    if (error.message?.includes('BLOB_READ_WRITE_TOKEN')) {
      return errorResponse(
        'Image deletion service not configured. This feature requires Vercel deployment.',
        503
      );
    }

    return errorResponse('Failed to delete image', 500);
  }
}
