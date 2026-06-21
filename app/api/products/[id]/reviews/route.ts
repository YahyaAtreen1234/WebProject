import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withUserAuth, errorResponse, successResponse } from '@/lib/middlewares';
import { PERMISSIONS } from '@/lib/permissions';

const REVIEWS_PER_PAGE = 10;

/**
 * GET /api/products/[id]/reviews
 * Get product reviews with pagination and sorting
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || String(REVIEWS_PER_PAGE));
    const sort = request.nextUrl.searchParams.get('sort') || 'newest'; // newest, oldest, helpful, highest-rated

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    // Build sort order
    const sortMap: Record<string, any> = {
      newest: { createdAt: 'desc' },
      oldest: { createdAt: 'asc' },
      helpful: { helpful: 'desc' },
      'highest-rated': { rating: 'desc' },
    };

    const orderBy = sortMap[sort] || sortMap.newest;

    // Get reviews with pagination
    const [reviews, total] = await Promise.all([
      prisma.productReview.findMany({
        where: { productId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.productReview.count({ where: { productId } }),
    ]);

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return successResponse({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      averageRating: parseFloat(avgRating.toFixed(1)),
      totalReviews: total,
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return errorResponse('Failed to fetch reviews', 500);
  }
}

/**
 * POST /api/products/[id]/reviews
 * Create a new product review
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await withUserAuth(request);
  if (!auth.success) return auth.response!;

  try {
    const productId = params.id;
    const body = await request.json();

    // Validate input
    const { rating, title, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return errorResponse('Rating must be between 1 and 5', 400);
    }

    if (!title || title.trim().length < 3) {
      return errorResponse('Title must be at least 3 characters', 400);
    }

    if (!comment || comment.trim().length < 10) {
      return errorResponse('Comment must be at least 10 characters', 400);
    }

    if (comment.trim().length > 1000) {
      return errorResponse('Comment must be at most 1000 characters', 400);
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.productReview.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: auth.userId!,
        },
      },
    });

    if (existingReview) {
      return errorResponse('You have already reviewed this product', 400);
    }

    // Check if user purchased this product (optional - for verified badge)
    const purchase = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: auth.userId,
        },
      },
    });

    // Create review
    const review = await prisma.productReview.create({
      data: {
        productId,
        userId: auth.userId!,
        rating: parseInt(String(rating)),
        title: title.trim(),
        comment: comment.trim(),
        verified: !!purchase, // Mark as verified if user purchased
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

    return successResponse(review, 201);
  } catch (error) {
    console.error('Create review error:', error);
    return errorResponse('Failed to create review', 500);
  }
}
