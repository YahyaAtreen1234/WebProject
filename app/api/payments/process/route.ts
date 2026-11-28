import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error:
        'Direct payment processing is disabled. Start a checkout at /api/checkout so the selected provider can verify the payment.',
    },
    { status: 410 }
  );
}
