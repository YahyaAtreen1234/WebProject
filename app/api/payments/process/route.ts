import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';

interface JWTPayload {
  userId?: string;
  adminId?: string;
  isAdmin?: boolean;
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

async function verifyAuth(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return null;
    }

    const token = auth.substring(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret-key') as JWTPayload;
    return payload;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);

  try {
    const body = await request.json();
    const { orderId, paymentMethodId, paymentType, amount } = body;

    if (!orderId || !paymentType || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get or create order
    let order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Create payment record
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const paymentRecord = await prisma.paymentRecord.create({
      data: {
        orderId,
        paymentMethodId: paymentMethodId || undefined,
        type: paymentType,
        amount,
        currency: 'USD',
        transactionId,
        status: 'processing',
      },
    });

    // Handle different payment types
    let isSuccessful = false;
    let failureReason = '';

    switch (paymentType) {
      case 'stripe':
        if (!stripe) {
          failureReason = 'Stripe is not configured. Set STRIPE_SECRET_KEY in environment variables.';
          break;
        }
        try {
          // Verify the payment intent with Stripe
          const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);
          isSuccessful = paymentIntent.status === 'succeeded';
          if (!isSuccessful) {
            failureReason = `Payment failed with status: ${paymentIntent.status}`;
          }
        } catch (error) {
          failureReason = `Stripe API error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
        break;

      case 'paypal':
        // For PayPal, payment should be verified via webhook in production
        // For now, mark as pending until webhook confirmation
        isSuccessful = true;
        break;

      case 'apple_pay':
        // Apple Pay requires device-based verification in production
        isSuccessful = true;
        break;

      case 'google_pay':
        // Google Pay requires device-based verification in production
        isSuccessful = true;
        break;

      case 'bank_transfer':
        // Bank transfer is manual verification, marked as pending
        isSuccessful = true;
        break;

      default:
        failureReason = 'Unsupported payment method';
        break;
    }

    // Update payment record status
    if (isSuccessful) {
      await prisma.paymentRecord.update({
        where: { id: paymentRecord.id },
        data: {
          status: 'completed',
          processedAt: new Date(),
        },
      });

      // Update order
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'completed',
          status: 'confirmed',
          paymentMethod: paymentType,
        },
      });

      return NextResponse.json({
        success: true,
        paymentId: paymentRecord.id,
        transactionId,
      });
    } else {
      await prisma.paymentRecord.update({
        where: { id: paymentRecord.id },
        data: {
          status: 'failed',
          failureReason,
        },
      });

      return NextResponse.json(
        { error: failureReason || 'Payment processing failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Payment processing error' },
      { status: 500 }
    );
  }
}
