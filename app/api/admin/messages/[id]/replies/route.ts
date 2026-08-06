import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { sendContactReply } from '@/lib/email';

function verifyAdmin(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return null;
    }
    const token = auth.substring(7);
    const payload = verifyToken(token) as Record<string, unknown> | null;
    return payload?.isAdmin ? payload : null;
  } catch {
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Replies are stored with type: 'admin' and shown to the customer as an
  // official response, so this must never be reachable anonymously.
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

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
      data: { status: 'replied', read: true },
    });

    // Email is the only channel the customer can actually receive this on --
    // there is no logged-in area where contact replies are visible. A delivery
    // failure must not lose the reply, which is already persisted, so report it
    // rather than throwing.
    const emailResult = await sendContactReply({
      to: contact.email,
      customerName: contact.name,
      subject: contact.subject,
      originalMessage: contact.message,
      reply: message,
    });

    return NextResponse.json(
      {
        success: true,
        data: reply,
        emailed: emailResult.success,
        emailSkipped: 'isDev' in emailResult ? emailResult.isDev : false,
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
