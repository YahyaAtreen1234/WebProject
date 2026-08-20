import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Everything the site footer renders, in one call.
 *
 * Public and read-only. Only active sections and links are returned, so
 * switching something off in the admin panel removes it from the site without
 * deleting the record.
 */
export async function GET() {
  try {
    const [sections, settings] = await Promise.all([
      prisma.footerSection.findMany({
        where: { active: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          links: {
            where: { active: true },
            orderBy: { sortOrder: 'asc' },
            select: { id: true, label: true, url: true },
          },
        },
      }),
      prisma.siteSettings.findUnique({ where: { id: 'main' } }),
    ]);

    return NextResponse.json({
      // A column with no links left in it would render as a bare heading.
      sections: sections.filter((section) => section.links.length > 0),
      settings: settings
        ? {
            siteName: settings.siteName,
            email: settings.email,
            phone: settings.phone,
            address: settings.address,
            newsletterHeading: settings.newsletterHeading,
            newsletterText: settings.newsletterText,
            addressHeading: settings.addressHeading,
            copyrightText: settings.copyrightText,
            social: {
              facebook: settings.facebookUrl,
              instagram: settings.instagramUrl,
              twitter: settings.twitterUrl,
              linkedin: settings.linkedinUrl,
              youtube: settings.youtubeUrl,
              tiktok: settings.tiktokUrl,
              whatsapp: settings.whatsappUrl,
            },
          }
        : null,
    });
  } catch (error) {
    // The footer is chrome, not content. If this table is unreachable the rest
    // of the page should still render, so degrade to an empty footer.
    console.error('[api/footer] Failed to load footer:', error);
    return NextResponse.json({ sections: [], settings: null });
  }
}
