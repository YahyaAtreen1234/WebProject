import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/middlewares';

/**
 * POST /api/products/[id]/reviews/[reviewId]/helpful
 * Mark a review as helpful (increment helpful count)
 * No authentication required - tracks by IP/session
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  try {
    const { reviewId } = params;

    // Get the review
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

    // Increment helpful count
    const updatedReview = await prisma.productReview.update({
      where: { id: reviewId },
      data: {
        helpful: {
          increment: 1,
        },
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
    console.error('Mark helpful error:', error);
    return errorResponse('Failed to mark review as helpful', 500);
  }
}
