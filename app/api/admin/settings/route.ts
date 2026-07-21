import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

function verifyAdmin(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      console.log('[SettingsAPI] No authorization header');
      return null;
    }
    const token = auth.substring(7);
    const payload = verifyToken(token) as Record<string, unknown> | null;
    if (!payload?.isAdmin) {
      console.log('[SettingsAPI] User is not admin:', payload);
      return null;
    }
    return payload;
  } catch (error) {
    console.error('[SettingsAPI] Token verification error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('[SettingsAPI] GET request received');
    const admin = verifyAdmin(request);
    if (!admin) {
      console.log('[SettingsAPI] GET: Admin verification failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let settings = await prisma.siteSettings.findFirst();
    console.log('[SettingsAPI] GET: Found settings:', settings?.id);

    if (!settings) {
      console.log('[SettingsAPI] GET: Creating default settings');
      settings = await prisma.siteSettings.create({
        data: {
          id: 'main',
          siteName: 'StonesLand',
          siteTagline: 'Premium Gems & Minerals',
        },
      });
      console.log('[SettingsAPI] GET: Default settings created');
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('[SettingsAPI] GET error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch settings',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('[SettingsAPI] PUT request received');
    const admin = verifyAdmin(request);
    if (!admin) {
      console.log('[SettingsAPI] PUT: Admin verification failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('[SettingsAPI] PUT: Request body received:', {
      siteName: body.siteName || body.websiteName,
      siteTagline: body.siteTagline || body.websiteTagline,
      email: body.email || body.contactEmail,
      phone: body.phone || body.contactPhone,
    });

    const {
      siteName,
      siteTagline,
      logo,
      email,
      phone,
      address,
    } = body;

    // Validation
    if (!siteName || !siteTagline) {
      console.log('[SettingsAPI] PUT: Validation failed - missing required fields');
      return NextResponse.json(
        { error: 'Website name and tagline are required' },
        { status: 400 }
      );
    }

    // Get existing settings or create new one
    let settings = await prisma.siteSettings.findFirst();
    console.log('[SettingsAPI] PUT: Found existing settings:', settings?.id);

    if (!settings) {
      console.log('[SettingsAPI] PUT: Creating new settings');
      settings = await prisma.siteSettings.create({
        data: {
          id: 'main',
          siteName,
          siteTagline,
          logo,
          email,
          phone,
          address,
        },
      });
      console.log('[SettingsAPI] PUT: Settings created successfully');
    } else {
      console.log('[SettingsAPI] PUT: Updating existing settings');
      settings = await prisma.siteSettings.update({
        where: { id: 'main' },
        data: {
          siteName,
          siteTagline,
          logo,
          email,
          phone,
          address,
        },
      });
      console.log('[SettingsAPI] PUT: Settings updated successfully');
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('[SettingsAPI] PUT error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update settings',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
