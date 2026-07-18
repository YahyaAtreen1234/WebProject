import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Try to connect to database
    const userCount = await prisma.user.count();

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      userCount,
      databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    }, { status: 500 });
  }
}
