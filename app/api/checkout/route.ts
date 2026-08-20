import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { calculateTotals } from '@/lib/pricing';

interface IncomingItem {
  id: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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

    if (!customerEmail || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Collapse duplicate lines and reject nonsense quantities before pricing.
    const requested = new Map<string, number>();
    for (const item of items as IncomingItem[]) {
      const quantity = Math.floor(Number(item?.quantity));
      if (!item?.id || !Number.isFinite(quantity) || quantity < 1) {
        return NextResponse.json({ error: 'Invalid item quantity' }, { status: 400 });
      }
      requested.set(item.id, (requested.get(item.id) ?? 0) + quantity);
    }

    // Price from the database, never from the request.
    //
    // This endpoint previously charged the subtotal, tax, shipping and total
    // sent by the browser, alongside a per-item `price`. Anyone able to post
    // JSON could therefore name their own price and buy a $10,500 specimen for
    // a cent. Amounts below are derived solely from stored product records.
    const products = await prisma.product.findMany({
      where: { id: { in: [...requested.keys()] } },
    });

    if (products.length !== requested.size) {
      return NextResponse.json(
        { error: 'One or more items are no longer available' },
        { status: 400 }
      );
    }

    const lineItems = [];
    let subtotal = 0;

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

      subtotal += product.price * quantity;
      lineItems.push({
        productId: product.id,
        name: product.title,
        amount: product.price,
        currency: 'usd',
        quantity,
      });
    }

    // Revalidate the discount server-side. The client shows a preview, but the
    // authoritative amount is recomputed here against the stored rule.
    let discountAmount = 0;
    let appliedCode = '';
    let freeShipping = false;

    if (discountCode) {
      const discount = await prisma.discount.findFirst({
        where: { code: discountCode, active: true },
      });

      const usable =
        discount &&
        (!discount.expiryDate || discount.expiryDate >= new Date()) &&
        subtotal >= discount.minOrderAmount &&
        (discount.maxUses === null || discount.timesUsed < discount.maxUses);

      if (usable) {
        if (discount.type === 'percentage') {
          discountAmount = (subtotal * discount.value) / 100;
          // maxDiscount caps a percentage code, e.g. "20% off, up to $50".
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
    }

    const totals = calculateTotals(subtotal, discountAmount);
    if (freeShipping) {
      totals.total = Math.round((totals.total - totals.shipping) * 100) / 100;
      totals.shipping = 0;
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 11)
      .toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
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

    const session = await createCheckoutSession({
      orderId: order.id,
      customerEmail,
      customerName,
      items: lineItems.map((line) => ({
        name: line.name,
        amount: line.amount,
        currency: line.currency,
        quantity: line.quantity,
      })),
      subtotal: totals.subtotal,
      tax: totals.tax,
      shipping: totals.shipping,
      discount: totals.discount,
      total: totals.total,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel?order_id=${order.id}`,
    });

    // `payment_intent` is null on a freshly created Checkout Session -- Stripe
    // only creates the intent once the customer submits payment. It is recorded
    // from the webhook instead; writing it here stored null and left refund
    // events unable to find their order.
    return NextResponse.json({
      sessionId: session.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: totals.total,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
