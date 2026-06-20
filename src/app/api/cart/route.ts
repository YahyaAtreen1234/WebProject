import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';

function getCartId(request: NextRequest): string {
  const cartId = request.headers.get('x-cart-id');
  if (cartId) return cartId;

  // Generate a simple cart ID based on IP or session
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  return `cart-${Buffer.from(ip).toString('base64')}`.substring(0, 50);
}

export async function GET(request: NextRequest) {
  try {
    const cartId = getCartId(request);

    let cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { id: cartId },
        include: { items: true },
      });
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cartId = getCartId(request);
    const body = await request.json();
    const { productId, quantity, price } = body;

    if (!productId || !quantity || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let cart = await prisma.cart.findUnique({
      where: { id: cartId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { id: cartId },
      });
    }

    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_productId: { cartId, productId },
      },
      update: {
        quantity: quantity > 0 ? quantity : undefined,
      },
      create: {
        cartId,
        productId,
        quantity,
        price,
      },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: true },
    });

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cartId = getCartId(request);
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      );
    }

    await prisma.cartItem.delete({
      where: {
        cartId_productId: { cartId, productId },
      },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: true },
    });

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { error: 'Failed to remove from cart' },
      { status: 500 }
    );
  }
}
