import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin
  const hashedPassword = await bcryptjs.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@stonesland.local' },
    update: {},
    create: {
      email: 'admin@stonesland.local',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      emailVerified: true,
    },
  });

  console.log('✅ Admin created:', admin.email);
  console.log('📧 Email: admin@stonesland.local');
  console.log('🔑 Password: admin123');

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
