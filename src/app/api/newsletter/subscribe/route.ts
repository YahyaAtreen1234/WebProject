import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing && existing.subscribed) {
      return NextResponse.json(
        { error: 'Already subscribed' },
        { status: 400 }
      );
    }

    // Update or create
    const subscriber = existing
      ? await prisma.newsletterSubscriber.update({
          where: { email },
          data: { subscribed: true, name: name || existing.name },
        })
      : await prisma.newsletterSubscriber.create({
          data: { email, name },
        });

    // Log the email
    await prisma.emailLog.create({
      data: {
        recipientEmail: email,
        subject: 'Welcome to our newsletter',
        type: 'welcome',
        status: 'sent',
        sentAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully subscribed to newsletter',
        subscriber,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}
