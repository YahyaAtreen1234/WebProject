import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('[DEBUG] Starting diagnostic check...');

    // Check 1: Count all contacts
    const totalCount = await prisma.contact.count();
    console.log('[DEBUG] Total contacts in database:', totalCount);

    // Check 2: Get all contacts with all fields
    const allContacts = await prisma.contact.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
    });

    console.log('[DEBUG] All contacts:', JSON.stringify(allContacts, null, 2));

    // Check 3: Count by status
    const statusNew = await prisma.contact.count({ where: { status: 'new' } });
    const statusReplied = await prisma.contact.count({ where: { status: 'replied' } });
    const statusClosed = await prisma.contact.count({ where: { status: 'closed' } });

    console.log('[DEBUG] Count by status - new:', statusNew, 'replied:', statusReplied, 'closed:', statusClosed);

    // Check 4: Get schema info
    const sampleContact = allContacts[0];
    console.log('[DEBUG] Sample contact structure:', sampleContact ? Object.keys(sampleContact) : 'No contacts');

    return NextResponse.json({
      success: true,
      diagnostic: {
        totalContacts: totalCount,
        contacts: allContacts,
        countByStatus: {
          new: statusNew,
          replied: statusReplied,
          closed: statusClosed,
        },
        sampleContact: sampleContact,
        schema: sampleContact ? Object.keys(sampleContact) : [],
      },
    });
  } catch (error) {
    console.error('[DEBUG] Diagnostic error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
