import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { code, orderAmount } = await request.json();

    if (!code || !orderAmount) {
      return NextResponse.json(
        { error: 'Code and order amount required' },
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

    // Check if active
    if (!discount.active) {
      return NextResponse.json(
        { error: 'This discount code is no longer active' },
        { status: 400 }
      );
    }

    // Check expiry
    if (discount.expiryDate && new Date() > discount.expiryDate) {
      return NextResponse.json(
        { error: 'This discount code has expired' },
        { status: 400 }
      );
    }

    // Check usage limits
    if (discount.maxUses && discount.timesUsed >= discount.maxUses) {
      return NextResponse.json(
        { error: 'This discount code has reached its usage limit' },
        { status: 400 }
      );
    }

    // Check minimum order amount
    if (orderAmount < discount.minOrderAmount) {
      return NextResponse.json(
        {
          error: `Minimum order amount of $${discount.minOrderAmount} required for this discount`,
        },
        { status: 400 }
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = (orderAmount * discount.value) / 100;
      if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
        discountAmount = discount.maxDiscount;
      }
    } else if (discount.type === 'fixed') {
      discountAmount = discount.value;
    } else if (discount.type === 'free_shipping') {
      // Free shipping is handled separately
      discountAmount = 0;
    }

    return NextResponse.json({
      valid: true,
      discount: {
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discountAmount,
        description: discount.description,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to validate discount code' },
      { status: 500 }
    );
  }
}
