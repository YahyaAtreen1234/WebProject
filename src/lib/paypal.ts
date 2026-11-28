interface PayPalLink {
  rel: string;
  href: string;
}

interface PayPalCapture {
  id: string;
  status: string;
  amount: {
    value: string;
    currency_code: string;
  };
}

export interface PayPalOrder {
  id: string;
  status: string;
  links?: PayPalLink[];
  purchase_units?: Array<{
    custom_id?: string;
    invoice_id?: string;
    payments?: {
      captures?: PayPalCapture[];
    };
  }>;
}

function getPayPalBaseUrl(): string {
  const mode = process.env.PAYPAL_MODE;
  if (mode === 'live') return 'https://api-m.paypal.com';
  if (mode === 'sandbox') return 'https://api-m.sandbox.paypal.com';
  throw new Error('PAYPAL_MODE must be set to sandbox or live.');
}

export function isPayPalConfigured(): boolean {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID &&
      process.env.PAYPAL_CLIENT_SECRET &&
      (process.env.PAYPAL_MODE === 'sandbox' || process.env.PAYPAL_MODE === 'live')
  );
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('PayPal client credentials are not configured.');
  }

  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  const data = (await response.json()) as { access_token?: string };

  if (!response.ok || !data.access_token) {
    throw new Error(`PayPal authentication failed (${response.status}).`);
  }

  return data.access_token;
}

async function paypalRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const accessToken = await getAccessToken();
  const response = await fetch(`${getPayPalBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  const data = (await response.json()) as T;

  if (!response.ok) {
    throw new Error(`PayPal request failed (${response.status}).`);
  }

  return data;
}

export async function createPayPalOrder(input: {
  orderId: string;
  orderNumber: string;
  total: number;
  returnUrl: string;
  cancelUrl: string;
}): Promise<PayPalOrder> {
  return paypalRequest<PayPalOrder>('/v2/checkout/orders', {
    method: 'POST',
    headers: { 'PayPal-Request-Id': `create-${input.orderId}` },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          custom_id: input.orderId,
          invoice_id: input.orderNumber,
          description: `Order ${input.orderNumber}`,
          amount: {
            currency_code: 'USD',
            value: input.total.toFixed(2),
          },
        },
      ],
      application_context: {
        user_action: 'PAY_NOW',
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
      },
    }),
  });
}

export async function capturePayPalOrder(orderId: string): Promise<PayPalOrder> {
  const existing = await paypalRequest<PayPalOrder>(
    `/v2/checkout/orders/${encodeURIComponent(orderId)}`
  );

  if (existing.status === 'COMPLETED') return existing;
  if (existing.status !== 'APPROVED') {
    throw new Error(`PayPal order cannot be captured from status ${existing.status}.`);
  }

  return paypalRequest<PayPalOrder>(
    `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: 'POST',
      headers: { 'PayPal-Request-Id': `capture-${orderId}` },
      body: JSON.stringify({}),
    }
  );
}
