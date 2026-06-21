import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'main' },
    });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { id: 'main' },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Get public settings error:', error);
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}
