import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { prisma } from '@/lib/db';
import { driverName, uploadDir } from '@/lib/storage';

/**
 * GET /api/health — deployment readiness check.
 *
 * Public and unauthenticated on purpose: a process manager, an uptime monitor
 * or a deploy script has to be able to call it before anyone can log in. It is
 * therefore written to prove the process is serving and its dependencies are
 * reachable without describing them — no hostnames, no credentials, no driver
 * error text, no row counts. /api/debug/status is the admin-only endpoint that
 * reports detail, and it stays that way.
 *
 * Returns 200 when every check passes, 503 when any fails, so a load balancer
 * or `deploy.sh` can gate on the status code alone.
 */

export const dynamic = 'force-dynamic';

type Check = { name: string; ok: boolean; detail?: string };

export async function GET() {
  const checks: Check[] = [];
  const started = Date.now();

  // --- database ---
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.push({ name: 'database', ok: true });
  } catch {
    // Deliberately not surfacing the driver's message: it names the host and,
    // on a schema error, the table involved.
    checks.push({ name: 'database', ok: false, detail: 'unreachable' });
  }

  // --- storage ---
  try {
    const driver = driverName();
    if (driver === 'local') {
      const dir = uploadDir();
      await fs.mkdir(dir, { recursive: true });
      // Writable, not merely present: a read-only mount is the failure that
      // actually happens in production, and it fails at upload time otherwise.
      await fs.access(dir, (await import('fs')).constants.W_OK);
      checks.push({ name: 'storage', ok: true, detail: driver });
    } else {
      // Remote drivers are configured, not probed: a network round trip on
      // every health check would make the check itself a source of load.
      checks.push({ name: 'storage', ok: true, detail: driver });
    }
  } catch {
    checks.push({ name: 'storage', ok: false, detail: 'upload directory not writable' });
  }

  // --- required configuration ---
  const missing = ['DATABASE_URL', 'JWT_SECRET', 'NEXT_PUBLIC_BASE_URL'].filter(
    (key) => !process.env[key]
  );
  checks.push({
    name: 'configuration',
    ok: missing.length === 0,
    // Naming an absent variable is safe and is the whole point; values are
    // never read here.
    detail: missing.length ? `missing: ${missing.join(', ')}` : undefined,
  });

  const ok = checks.every((c) => c.ok);

  return NextResponse.json(
    {
      status: ok ? 'ok' : 'degraded',
      uptimeSeconds: Math.round(process.uptime()),
      durationMs: Date.now() - started,
      checks,
    },
    {
      status: ok ? 200 : 503,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    }
  );
}
