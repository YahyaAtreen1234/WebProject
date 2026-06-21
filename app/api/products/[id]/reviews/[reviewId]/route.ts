import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withUserAuth, errorResponse, successResponse } from '@/lib/middlewares';

/**
 * PUT /api/products/[id]/reviews/[reviewId]
 * Update a review (only by the author)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  const auth = await withUserAuth(request);
  if (!auth.success) return auth.response!;

  try {
    const { reviewId } = params;
    const body = await request.json();
    const { rating, title, comment } = body;

    // Get the review
    const review = await prisma.productReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return errorResponse('Review not found', 404);
    }

    // Check if user owns the review
    if (review.userId !== auth.userId) {
      return errorResponse('You can only edit your own review', 403);
    }

    // Validate input
    if (rating && (rating < 1 || rating > 5)) {
      return errorResponse('Rating must be between 1 and 5', 400);
    }

    if (title && title.trim().length < 3) {
      return errorResponse('Title must be at least 3 characters', 400);
    }

    if (comment && comment.trim().length < 10) {
      return errorResponse('Comment must be at least 10 characters', 400);
    }

    if (comment && comment.trim().length > 1000) {
      return errorResponse('Comment must be at most 1000 characters', 400);
    }

    // Update review
    const updatedReview = await prisma.productReview.update({
      where: { id: reviewId },
      data: {
        ...(rating && { rating: parseInt(String(rating)) }),
        ...(title && { title: title.trim() }),
        ...(comment && { comment: comment.trim() }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    return successResponse(updatedReview);
  } catch (error) {
    console.error('Update review error:', error);
    return errorResponse('Failed to update review', 500);
  }
}

/**
 * DELETE /api/products/[id]/reviews/[reviewId]
 * Delete a review (only by the author or admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  const auth = await withUserAuth(request);
  if (!auth.success) return auth.response!;

  try {
    const { reviewId } = params;

    // Get the review
    const review = await prisma.productReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return errorResponse('Review not found', 404);
    }

    // Check if user owns the review or is admin
    if (review.userId !== auth.userId && auth.role !== 'admin') {
      return errorResponse('You can only delete your own review', 403);
    }

    // Delete review
    await prisma.productReview.delete({
      where: { id: reviewId },
    });

    return successResponse({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    return errorResponse('Failed to delete review', 500);
  }
}

/**
 * GET /api/products/[id]/reviews/[reviewId]
 * Get a single review
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  try {
    const { reviewId } = params;

    const review = await prisma.productReview.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    if (!review) {
      return errorResponse('Review not found', 404);
    }

    return successResponse(review);
  } catch (error) {
    console.error('Get review error:', error);
    return errorResponse('Failed to fetch review', 500);
  }
}
