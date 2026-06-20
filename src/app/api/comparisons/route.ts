import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';
import jwt from 'jsonwebtoken';

async function verifyAuth(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return null;
    }
    const token = auth.substring(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret-key') as any;
    return payload;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const userId = auth?.userId;

  if (!userId && !sessionId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const comparison = await prisma.productComparison.findFirst({
      where: userId ? { userId } : { sessionId },
      include: {
        comparisonItems: true,
      },
    });

    if (!comparison) {
      return NextResponse.json({ comparisonItems: [] });
    }

    return NextResponse.json(comparison);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch comparison' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId') || `session_${Date.now()}`;
  const userId = auth?.userId;

  try {
    let comparison = await prisma.productComparison.findFirst({
      where: userId ? { userId } : { sessionId },
    });

    if (!comparison) {
      comparison = await prisma.productComparison.create({
        data: {
          userId: userId || null,
          sessionId: !userId ? sessionId : null,
        },
        include: { comparisonItems: true },
      });
    }

    return NextResponse.json(comparison, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create comparison' },
      { status: 500 }
    );
  }
}