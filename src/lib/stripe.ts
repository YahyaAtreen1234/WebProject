import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

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

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: data.customerEmail,
    line_items: lineItems,
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
