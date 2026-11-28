import Stripe from 'stripe';

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY.');
  }

  return new Stripe(secretKey, {
    apiVersion: '2023-10-16',
    timeout: 20_000,
    maxNetworkRetries: 2,
  });
}

export interface CheckoutSessionData {
  orderId: string;
  customerEmail: string;
  customerName: string;
  items: {
    name: string;
    amount: number;
    currency: string;
    quantity: number;
  }[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount?: number;
  total: number;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession(data: CheckoutSessionData) {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = data.items.map((item) => ({
    price_data: {
      currency: item.currency,
      product_data: { name: item.name },
      unit_amount: Math.round(item.amount * 100),
    },
    quantity: item.quantity,
  }));

  if (data.tax > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Tax' },
        unit_amount: Math.round(data.tax * 100),
      },
      quantity: 1,
    });
  }

  if (data.shipping > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Shipping' },
        unit_amount: Math.round(data.shipping * 100),
      },
      quantity: 1,
    });
  }

  let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
  if (data.discount && data.discount > 0) {
    const coupon = await getStripeClient().coupons.create({
      amount_off: Math.round(data.discount * 100),
      currency: 'usd',
      duration: 'once',
      name: 'Discount',
    });
    discounts = [{ coupon: coupon.id }];
  }

  return getStripeClient().checkout.sessions.create({
    mode: 'payment',
    customer_email: data.customerEmail,
    line_items: lineItems,
    ...(discounts && { discounts }),
    success_url: data.successUrl,
    cancel_url: data.cancelUrl,
    metadata: { orderId: data.orderId, customerName: data.customerName },
    payment_intent_data: {
      metadata: { orderId: data.orderId },
    },
  });
}

export async function retrieveSession(sessionId: string) {
  return getStripeClient().checkout.sessions.retrieve(sessionId);
}
