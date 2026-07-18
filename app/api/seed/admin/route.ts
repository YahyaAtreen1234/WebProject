import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcryptjs from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { message: 'Admin user already exists', email: existingAdmin.email },
        { status: 200 }
      );
    }

    // Create admin user
    const hashedPassword = await bcryptjs.hash('AdminPassword123!', 10);
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@minerals.local',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        emailVerified: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Admin user created successfully',
        email: admin.email,
        password: 'AdminPassword123!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        error: 'Failed to seed admin user',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
