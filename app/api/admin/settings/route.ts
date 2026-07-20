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
    return payload?.isAdmin ? payload : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'main' },
    });

    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        id: 'main',
        siteName: 'StonesLand',
        siteTagline: 'Premium Gems & Minerals',
        logo: null,
        email: null,
        phone: null,
        address: null,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      {
        id: 'main',
        siteName: 'StonesLand',
        siteTagline: 'Premium Gems & Minerals',
        logo: null,
        email: null,
        phone: null,
        address: null,
      }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const settings = await prisma.siteSettings.upsert({
      where: { id: 'main' },
      create: {
        id: 'main',
        siteName: body.siteName || 'StonesLand',
        siteTagline: body.siteTagline || 'Premium Gems & Minerals',
        logo: body.logo,
        email: body.email,
        phone: body.phone,
        address: body.address,
      },
      update: {
        siteName: body.siteName,
        siteTagline: body.siteTagline,
        logo: body.logo,
        email: body.email,
        phone: body.phone,
        address: body.address,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
