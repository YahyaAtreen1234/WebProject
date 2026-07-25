import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

function verifyAdmin(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return null;
    }

    const token = auth.substring(7);
    const payload = verifyToken(token) as Record<string, unknown> | null;

    if (!payload?.isAdmin) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const admin = verifyAdmin(request);
  console.log('[AdminMessages] Admin auth check:', admin ? 'AUTHENTICATED' : 'FAILED');

  if (!admin) {
    console.log('[AdminMessages] Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const skip = (page - 1) * limit;

    const where = status && status !== 'all' ? { status } : {};

    console.log('[AdminMessages] Query params - status:', status, 'page:', page);
    console.log('[AdminMessages] Database query - where:', JSON.stringify(where));

    const [messages, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: { replies: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contact.count({ where }),
    ]);

    console.log('[AdminMessages] Database response - found', messages.length, 'messages, total:', total);
    console.log('[AdminMessages] First message sample:', messages[0] ? { id: messages[0].id, subject: messages[0].subject, status: messages[0].status } : 'none');

    return NextResponse.json({
      success: true,
      data: messages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[AdminMessages] Get messages error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
