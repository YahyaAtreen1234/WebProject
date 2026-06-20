import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';

export async function GET(request: NextRequest) {
  try {
    const policies = await prisma.guaranteePolicy.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(policies);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, days, terms, conditions } = body;

    if (!title || !days) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const policy = await prisma.guaranteePolicy.create({
      data: {
        title,
        description: description || '',
        days,
        terms: terms || '',
        conditionsJson: JSON.stringify(conditions || []),
      },
    });

    return NextResponse.json(policy, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}