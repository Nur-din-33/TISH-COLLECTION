// Run with: node src/prisma/seed.js
// ============================================================
// TO CHANGE ADMIN CREDENTIALS:
// Edit ADMIN_EMAIL and ADMIN_PASSWORD below, then run this file
// ============================================================
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// ✏️  CHANGE THESE TO YOUR OWN ADMIN CREDENTIALS
const ADMIN_NAME     = process.env.ADMIN_NAME     || 'Admin User';
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@dropke.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@1234';
const ADMIN_PHONE    = process.env.ADMIN_PHONE    || '+254700000000';

async function main() {
  console.log('🌱 Seeding database...');

  const adminPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { password: adminPassword, name: ADMIN_NAME },
    create: {
      email: ADMIN_EMAIL,
      password: adminPassword,
      name: ADMIN_NAME,
      phone: ADMIN_PHONE,
      role: 'ADMIN',
      isVerified: true,
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);
  console.log(`🔑 Admin password: ${ADMIN_PASSWORD}`);

  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'electronics' }, update: {}, create: { name: 'Electronics', slug: 'electronics' } }),
    prisma.category.upsert({ where: { slug: 'fashion' },     update: {}, create: { name: 'Fashion',     slug: 'fashion'     } }),
    prisma.category.upsert({ where: { slug: 'home-garden' }, update: {}, create: { name: 'Home & Garden',slug: 'home-garden' } }),
    prisma.category.upsert({ where: { slug: 'beauty' },      update: {}, create: { name: 'Beauty & Health',slug: 'beauty'   } }),
    prisma.category.upsert({ where: { slug: 'sports' },      update: {}, create: { name: 'Sports & Outdoors',slug: 'sports' } }),
  ]);
  console.log('✅ Categories created');

  const supplier = await prisma.supplier.upsert({
    where: { email: 'supplier@dropke.com' },
    update: {},
    create: { name: 'AliExpress KE Partner', email: 'supplier@dropke.com', country: 'China' },
  });

  const products = [
    { name: 'Wireless Bluetooth Earbuds', slug: 'wireless-bluetooth-earbuds', description: 'Premium sound quality earbuds with 24-hour battery life. Sweat resistant.', price: 2499, costPrice: 800, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500', featured: true, categoryId: categories[0].id, supplierId: supplier.id },
    { name: 'Smart Watch Fitness Tracker', slug: 'smart-watch-fitness-tracker', description: 'Track steps, heart rate, and sleep. Compatible with all phones.', price: 4999, costPrice: 1800, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', featured: true, categoryId: categories[0].id, supplierId: supplier.id },
    { name: 'Ankara Print Tote Bag', slug: 'ankara-print-tote-bag', description: 'Beautiful African print canvas tote bag. Large size.', price: 1299, costPrice: 400, stock: 100, imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500', featured: false, categoryId: categories[1].id, supplierId: supplier.id },
    { name: 'Solar Power Bank 20000mAh', slug: 'solar-power-bank-20000mah', description: 'Dual USB ports. Solar charging panel — perfect for upcountry use.', price: 3499, costPrice: 1200, stock: 45, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', featured: true, categoryId: categories[0].id, supplierId: supplier.id },
    { name: 'Non-Stick Cooking Set (5pc)', slug: 'non-stick-cooking-set-5-piece', description: 'Complete kitchen set. Works on gas and electric stoves.', price: 5999, costPrice: 2200, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500', featured: false, categoryId: categories[2].id, supplierId: supplier.id },
    { name: 'Kenyan Coffee Mug Set (4pc)', slug: 'kenyan-coffee-mug-set', description: 'Premium ceramic mugs. Microwave and dishwasher safe.', price: 1799, costPrice: 600, stock: 80, imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500', featured: false, categoryId: categories[2].id, supplierId: supplier.id },
  ];

  for (const p of products) {
    await prisma.product.upsert({ where: { slug: p.slug }, update: {}, create: p });
  }
  console.log('✅ Sample products created');
  console.log('\n🎉 Done! Admin login:');
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
