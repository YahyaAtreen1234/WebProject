import { NextRequest, NextResponse } from 'next/server';
import { createPayPalOrder, isPayPalConfigured } from '@/lib/paypal';
import { prisma } from '@/lib/db';
import { calculateTotals, roundMoney, toCents } from '@/lib/pricing';
import { createCheckoutSession, isStripeConfigured } from '@/lib/stripe';

interface IncomingItem {
  id: string;
  quantity: number;
}

type PaymentProvider = 'stripe' | 'paypal' | 'bank_transfer';

function getApplicationOrigin(request: NextRequest): string {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : request.nextUrl.origin);
  const parsedOrigin = new URL(configuredOrigin);

  if (parsedOrigin.protocol !== 'https:' && parsedOrigin.hostname !== 'localhost') {
    throw new Error('Checkout requires an HTTPS application URL.');
  }

  return parsedOrigin.origin;
}

export async function POST(request: NextRequest) {
  let orderId: string | undefined;
  let provider: PaymentProvider = 'stripe';

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid checkout request.' }, { status: 400 });
    }
    const {
      customerEmail,
      customerName,
      customerPhone,
      items,
      address,
      city,
      postalCode,
      country,
      state,
      discountCode,
    } = body;

    provider = body.paymentProvider || 'stripe';
    if (!['stripe', 'paypal', 'bank_transfer'].includes(provider)) {
      return NextResponse.json({ error: 'Unsupported payment method.' }, { status: 400 });
    }

    if (!customerEmail || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing required checkout fields.' }, { status: 400 });
    }

    if (provider === 'stripe' && !isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Card and wallet checkout is not configured. Please contact the store.' },
        { status: 503 }
      );
    }
    if (provider === 'paypal' && !isPayPalConfigured()) {
      return NextResponse.json(
        { error: 'PayPal is not configured. Please choose another payment method.' },
        { status: 503 }
      );
    }
    const bankTransferInstructions = process.env.BANK_TRANSFER_INSTRUCTIONS?.trim();
    if (provider === 'bank_transfer' && !bankTransferInstructions) {
      return NextResponse.json(
        { error: 'Bank transfer is not configured. Please choose another payment method.' },
        { status: 503 }
      );
    }

    const requested = new Map<string, number>();
    for (const item of items as IncomingItem[]) {
      const quantity = Math.floor(Number(item?.quantity));
      if (typeof item?.id !== 'string' || !item.id || !Number.isSafeInteger(quantity) || quantity < 1) {
        return NextResponse.json({ error: 'Invalid item or quantity.' }, { status: 400 });
      }
      requested.set(item.id, (requested.get(item.id) ?? 0) + quantity);
    }

    const products = await prisma.product.findMany({
      where: { id: { in: [...requested.keys()] } },
    });

    if (products.length !== requested.size) {
      return NextResponse.json(
        { error: 'One or more items are no longer available.' },
        { status: 409 }
      );
    }

    const lineItems = [];
    let subtotalCents = 0;
    for (const product of products) {
      const quantity = requested.get(product.id)!;
      if (product.stock < quantity) {
        return NextResponse.json(
          {
            error:
              product.stock === 0
                ? `${product.title} has sold out.`
                : `Only ${product.stock} left of ${product.title}.`,
          },
          { status: 409 }
        );
      }

      const unitAmount = toCents(product.price) / 100;
      subtotalCents += toCents(product.price) * quantity;
      lineItems.push({
        productId: product.id,
        name: product.title,
        amount: unitAmount,
        currency: 'usd',
        quantity,
      });
    }
    const subtotal = subtotalCents / 100;

    let discountAmount = 0;
    let appliedCode = '';
    let freeShipping = false;
    if (discountCode) {
      const normalizedCode = String(discountCode).trim();
      const discount = await prisma.discount.findFirst({
        where: { code: normalizedCode, active: true },
      });
      const usable =
        discount &&
        (!discount.expiryDate || discount.expiryDate >= new Date()) &&
        subtotal >= discount.minOrderAmount &&
        (discount.maxUses === null || discount.timesUsed < discount.maxUses);

      if (!usable) {
        return NextResponse.json(
          { error: 'The discount code is no longer valid. Remove it or apply another code.' },
          { status: 400 }
        );
      }

      if (discount.type === 'percentage') {
        discountAmount = (subtotal * discount.value) / 100;
        if (discount.maxDiscount !== null) {
          discountAmount = Math.min(discountAmount, discount.maxDiscount);
        }
      } else if (discount.type === 'fixed') {
        discountAmount = discount.value;
      } else if (discount.type === 'free_shipping') {
        freeShipping = true;
      }
      appliedCode = discount.code;
    }

    const totals = calculateTotals(subtotal, discountAmount);
    if (freeShipping) {
      totals.total = roundMoney(totals.total - totals.shipping);
      totals.shipping = 0;
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 11)
      .toUpperCase()}`;
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: customerName || '',
        customerEmail,
        customerPhone: customerPhone || '',
        address: address || '',
        city: city || '',
        state: state || '',
        postalCode: postalCode || '',
        country: country || '',
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.shipping,
        discount: totals.discount || null,
        discountCode: appliedCode || null,
        totalAmount: totals.total,
        paymentMethod: provider,
        status: 'pending',
        paymentStatus: 'pending',
        items: {
          create: lineItems.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            price: line.amount,
            title: line.name,
          })),
        },
      },
    });
    orderId = order.id;

    const origin = getApplicationOrigin(request);
    if (provider === 'stripe') {
      const session = await createCheckoutSession({
        orderId: order.id,
        customerEmail,
        customerName: customerName || '',
        items: lineItems,
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.shipping,
        discount: totals.discount,
        total: totals.total,
        successUrl: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
        cancelUrl: `${origin}/checkout/cancel?order_id=${order.id}`,
      });

      if (!session.url) throw new Error('Stripe did not return a hosted checkout URL.');
      return NextResponse.json({
        provider,
        checkoutUrl: session.url,
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: totals.total,
      });
    }

    if (provider === 'paypal') {
      const paypalOrder = await createPayPalOrder({
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: totals.total,
        returnUrl: `${origin}/checkout/paypal/return?order_id=${order.id}`,
        cancelUrl: `${origin}/checkout/cancel?order_id=${order.id}`,
      });
      const approvalUrl = paypalOrder.links?.find(
        (link) => link.rel === 'approve' || link.rel === 'payer-action'
      )?.href;

      if (!paypalOrder.id || !approvalUrl) {
        throw new Error('PayPal did not return an order approval URL.');
      }

      await prisma.paymentRecord.create({
        data: {
          orderId: order.id,
          type: 'paypal',
          amount: totals.total,
          currency: 'USD',
          status: 'pending',
          transactionId: paypalOrder.id,
        },
      });

      return NextResponse.json({
        provider,
        checkoutUrl: approvalUrl,
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: totals.total,
      });
    }

    await prisma.paymentRecord.create({
      data: {
        orderId: order.id,
        type: 'bank_transfer',
        amount: totals.total,
        currency: 'USD',
        status: 'pending',
      },
    });
    return NextResponse.json({
      provider,
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: totals.total,
      instructions: bankTransferInstructions,
    });
  } catch (error) {
    console.error(`[Checkout] Failed to start ${provider} checkout:`, error);

    if (orderId) {
      try {
        await prisma.order.updateMany({
          where: { id: orderId, paymentStatus: 'pending' },
          data: { paymentStatus: 'failed', status: 'cancelled' },
        });
      } catch (updateError) {
        console.error('[Checkout] Failed to mark incomplete order:', updateError);
      }
    }

    return NextResponse.json(
      {
        error:
          provider === 'paypal'
            ? 'Could not start PayPal checkout. You have not been charged; please retry or choose another method.'
            : provider === 'bank_transfer'
              ? 'Could not prepare bank transfer instructions. Please contact the store.'
              : 'Could not start card checkout. You have not been charged; please retry or choose another method.',
      },
      { status: 502 }
    );
  }
}
