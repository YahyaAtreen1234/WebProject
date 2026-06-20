import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';
import jwt from 'jsonwebtoken';

async function verifyAuth(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return null;
    const token = auth.substring(7);
    return jwt.verify(token, process.env.JWT_SECRET || 'secret-key') as any;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const auth = await verifyAuth(request);

  try {
    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (auth?.userId) where.userId = auth.userId;

    const tickets = await prisma.supportTicket.findMany({
      where,
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 5 } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, category, message } = body;

    if (!subject || !email) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber: `TK_${Date.now()}`,
        name,
        email,
        subject,
        category: category || 'general',
        messages: {
          create: {
            senderType: 'customer',
            senderName: name,
            senderEmail: email,
            message,
          },
        },
      },
      include: { messages: true },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}