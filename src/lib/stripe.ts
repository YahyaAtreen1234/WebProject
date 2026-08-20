import Stripe from 'stripe';

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
};

export const stripe = process.env.STRIPE_SECRET_KEY ? getStripe() : (null as any);

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
  const lineItems = data.items.map((item) => ({
    price_data: {
      currency: item.currency,
      product_data: {
        name: item.name,
      },
      unit_amount: Math.round(item.amount * 100),
    },
    quantity: item.quantity,
  }));

  // Add tax and shipping as line items
  if (data.tax > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Tax',
        },
        unit_amount: Math.round(data.tax * 100),
      },
      quantity: 1,
    });
  }

  if (data.shipping > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Shipping',
        },
        unit_amount: Math.round(data.shipping * 100),
      },
      quantity: 1,
    });
  }

  // Stripe line items cannot carry a negative amount, so a discount is applied
  // as a one-off coupon on the session rather than as another line. Without
  // this the customer would be billed the undiscounted sum of the lines.
  let discounts;
  if (data.discount && data.discount > 0) {
    const coupon = await stripe.coupons.create({
      amount_off: Math.round(data.discount * 100),
      currency: 'usd',
      duration: 'once',
      name: 'Discount',
    });
    discounts = [{ coupon: coupon.id }];
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: data.customerEmail,
    line_items: lineItems,
    ...(discounts && { discounts }),
    success_url: data.successUrl,
    cancel_url: data.cancelUrl,
    metadata: {
      orderId: data.orderId,
      customerName: data.customerName,
    },
  });

  return session;
}

export async function retrieveSession(sessionId: string) {
  return await stripe.checkout.sessions.retrieve(sessionId);
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
}
