import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAdminAuth } from '@/lib/middlewares';

/**
 * GET /api/debug/status
 *
 * Deployment health check. Admin-only: the failure path reports the database
 * driver's own error text, which names the host and, for schema errors, the
 * table and column involved. That is exactly what is useful when a deployment
 * will not connect, and exactly what should not be readable by the public.
 */
export async function GET(request: NextRequest) {
  const auth = await withAdminAuth(request);
  if (!auth.success) return auth.response!;

  try {
    const userCount = await prisma.user.count();

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      userCount,
      databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      },
      { status: 500 }
    );
  }
}
