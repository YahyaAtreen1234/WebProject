import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { validateImageFile, generateUniqueFilename } from '@/lib/upload';
import { withUserAuth, errorResponse, successResponse } from '@/lib/middlewares';

/**
 * POST /api/upload
 * Upload a single image
 * Requires authentication
 */
export async function POST(request: NextRequest) {
  const auth = await withUserAuth(request);
  if (!auth.success) return auth.response!;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return errorResponse('No file provided', 400);
    }

    // Validate file
    validateImageFile(file);

    // Generate unique filename
    const filename = generateUniqueFilename(file.name);
    const folder = `products/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const pathname = `${folder}/${filename}`;

    // Upload to Vercel Blob
    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    return successResponse(
      {
        url: blob.url,
        filename,
        size: file.size,
        type: file.type,
      },
      201
    );
  } catch (error: any) {
    console.error('Upload error:', error);

    // Handle specific error types
    if (error.message.includes('File size')) {
      return errorResponse(error.message, 400);
    }

    if (error.message.includes('type') || error.message.includes('extension')) {
      return errorResponse(error.message, 400);
    }

    if (error.message?.includes('BLOB_READ_WRITE_TOKEN')) {
      return errorResponse(
        'Image upload service not configured. This feature requires Vercel deployment.',
        503
      );
    }

    return errorResponse('Failed to upload image', 500);
  }
}
