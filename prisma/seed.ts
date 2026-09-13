import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Creates the initial administrator.
 *
 * This runs as part of `npm run build`, which means it runs on every
 * production deploy. It previously created admin@stonesland.local with the
 * password "admin123" written in this file, so every deployed copy of the site
 * shipped with a working administrator login that anyone reading the source
 * could use.
 *
 * The credentials now come from ADMIN_EMAIL and ADMIN_PASSWORD. In production
 * they are required: seeding is skipped, loudly, rather than falling back to a
 * guessable default. Local development keeps the old convenience default so
 * `npm run dev` on a fresh database still works without configuration.
 */
async function main() {
  console.log('🌱 Seeding database...');

  const isProduction = process.env.NODE_ENV === 'production';
  const email = process.env.ADMIN_EMAIL || 'admin@stonesland.local';
  const password = process.env.ADMIN_PASSWORD;

  if (isProduction && !password) {
    console.warn(
      '\n⚠️  Skipping admin seed: ADMIN_PASSWORD is not set.\n' +
        '   Refusing to create an administrator with a default password on a\n' +
        '   production deployment. Set ADMIN_EMAIL and ADMIN_PASSWORD in your\n' +
        '   environment and rebuild to create the account.\n'
    );
    return;
  }

  if (isProduction && password!.length < 12) {
    throw new Error(
      'ADMIN_PASSWORD must be at least 12 characters in production. ' +
        'Seeding aborted so a weak administrator password is not created.'
    );
  }

  const resolvedPassword = password || 'admin123';
  const hashedPassword = await bcryptjs.hash(resolvedPassword, 10);

  // `update: {}` so re-running a build never resets a password an
  // administrator has since changed through the dashboard.
  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      emailVerified: true,
    },
  });

  console.log('✅ Admin ready:', admin.email);
  if (!password) {
    console.log('🔑 Using the development default password (ADMIN_PASSWORD unset).');
  }

  console.log('✨ Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
