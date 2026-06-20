import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { code, email } = await request.json();

    if (!code || !email) {
      return NextResponse.json(
        { error: 'Code and email required' },
        { status: 400 }
      );
    }

    // Find the discount code
    const discount = await prisma.discount.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!discount) {
      return NextResponse.json(
        { error: 'Invalid discount code' },
        { status: 404 }
      );
    }

    // Create usage record
    await prisma.discountUsage.create({
      data: {
        discountId: discount.id,
        email,
      },
    });

    // Increment usage counter
    await prisma.discount.update({
      where: { id: discount.id },
      data: { timesUsed: discount.timesUsed + 1 },
    });

    return NextResponse.json({
      success: true,
      message: 'Discount applied successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to apply discount' },
      { status: 500 }
    );
  }
}
