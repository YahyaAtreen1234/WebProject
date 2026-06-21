import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || message.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Reply message is required' },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.findUnique({
      where: { id: params.id },
    });

    if (!contact) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    const reply = await prisma.contactReply.create({
      data: {
        contactId: params.id,
        message,
        type: 'admin',
      },
    });

    // Update contact status to replied
    await prisma.contact.update({
      where: { id: params.id },
      data: { status: 'replied' },
    });

    return NextResponse.json(
      {
        success: true,
        data: reply,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add reply error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add reply' },
      { status: 500 }
    );
  }
}
