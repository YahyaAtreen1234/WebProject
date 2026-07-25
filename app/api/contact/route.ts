import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isValidEmail } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // This endpoint requires admin authentication
    // For now, returning a simple message
    return NextResponse.json({
      message: 'POST contact form submissions to this endpoint',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    console.log('[Contact API] Creating contact with data:', { name, email, subject });

    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message,
        status: 'new',
        read: false,
      },
    });

    console.log('[Contact API] Contact created successfully:', { id: contact.id, status: contact.status, read: contact.read });

    return NextResponse.json(
      { message: 'Contact message received', id: contact.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}
