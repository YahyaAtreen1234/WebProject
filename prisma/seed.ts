import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin
  const hashedPassword = await bcryptjs.hash('admin123', 10);

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@stonesland.local' },
    update: {},
    create: {
      email: 'admin@stonesland.local',
      password: hashedPassword,
      name: 'Admin User',
    },
  });

  console.log('✅ Admin created:', admin.email);

  // Create default site settings
  const settings = await prisma.siteSettings.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      siteName: 'StonesLand',
      siteTagline: 'Premium Gems & Minerals',
    },
  });

  console.log('✅ Site settings created');

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
