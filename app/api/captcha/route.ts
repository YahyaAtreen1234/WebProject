import { NextResponse } from 'next/server';
import { createChallenge } from '@/lib/captcha';

export async function GET() {
  try {
    const challenge = createChallenge();
    return NextResponse.json(challenge);
  } catch (error) {
    console.error('[api/captcha] Failed to create challenge:', error);
    return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
  }
}
