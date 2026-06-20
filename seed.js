const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function hashPassword(password) {
  return bcryptjs.hash(password, 10);
}

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await hashPassword(adminPassword);

  const admin = await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@minerals.local' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@minerals.local',
      password: hashedPassword,
      name: 'Admin User',
    },
  });

  console.log(`✅ Admin created: ${admin.email}`);

  // Create sample products
  const products = [
    {
      title: 'Amethyst Geode',
      description: 'Beautiful deep purple amethyst geode with natural formations. Perfect for collectors and crystal enthusiasts.',
      price: 129.99,
      category: 'Geodes',
      stock: 5,
      featured: true,
    },
    {
      title: 'Rose Quartz Crystal',
      description: 'Polished rose quartz stone, known as the stone of love and compassion. Ideal for meditation and healing.',
      price: 89.99,
      category: 'Crystals',
      stock: 10,
      featured: true,
    },
    {
      title: 'Black Tourmaline',
      description: 'Raw black tourmaline specimen with excellent protective properties. High quality mineral piece.',
      price: 149.99,
      category: 'Raw Minerals',
      stock: 8,
      featured: false,
    },
    {
      title: 'Citrine Cluster',
      description: 'Golden yellow citrine cluster. Associated with abundance and prosperity. Vibrant and radiant.',
      price: 199.99,
      category: 'Clusters',
      stock: 3,
      featured: true,
    },
    {
      title: 'Smoky Quartz',
      description: 'Translucent smoky quartz crystal. Known for grounding energy and protection from negative thoughts.',
      price: 79.99,
      category: 'Crystals',
      stock: 12,
      featured: false,
    },
    {
      title: 'Selenite Wand',
      description: 'Pure white selenite wand, ideal for cleansing and clearing energy. Smooth and elegant piece.',
      price: 59.99,
      category: 'Wands',
      stock: 15,
      featured: false,
    },
    {
      title: 'Labradorite Stone',
      description: 'Labradorite with beautiful iridescent colors. Great for intuition and spiritual transformation.',
      price: 109.99,
      category: 'Polished Stones',
      stock: 7,
      featured: false,
    },
    {
      title: 'Clear Quartz Point',
      description: 'High quality clear quartz point, double terminated. Master healer crystal with excellent clarity.',
      price: 69.99,
      category: 'Points',
      stock: 20,
      featured: false,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { title: product.title },
      update: {},
      create: product,
    });
  }

  console.log(`✅ ${products.length} products created`);
  console.log('🎉 Database seeded successfully!');
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
