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
    prisma.category.upsert({ where: { slug: 'mens-clothing' },   update: {}, create: { name: "Men's Clothing",   slug: 'mens-clothing'   } }),
    prisma.category.upsert({ where: { slug: 'womens-clothing' }, update: {}, create: { name: "Women's Clothing", slug: 'womens-clothing' } }),
    prisma.category.upsert({ where: { slug: 'sneakers' },       update: {}, create: { name: 'Sneakers',          slug: 'sneakers'       } }),
    prisma.category.upsert({ where: { slug: 'formal-shoes' },   update: {}, create: { name: 'Formal Shoes',      slug: 'formal-shoes'   } }),
    prisma.category.upsert({ where: { slug: 'accessories' },    update: {}, create: { name: 'Accessories',       slug: 'accessories'    } }),
  ]);
  console.log('✅ Categories created');

  const supplier = await prisma.supplier.upsert({
    where: { email: 'supplier@dropke.com' },
    update: {},
    create: { name: 'AliExpress KE Partner', email: 'supplier@dropke.com', country: 'China' },
  });

  const products = [
    { name: 'Classic Fit Oxford Shirt', slug: 'classic-fit-oxford-shirt', description: 'Premium cotton Oxford shirt with button-down collar. Perfect for smart-casual wear.', price: 2499, costPrice: 800, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500', featured: true, categoryId: categories[0].id, supplierId: supplier.id },
    { name: 'Slim Fit Chino Trousers', slug: 'slim-fit-chino-trousers', description: 'Comfortable stretch chinos with a modern slim fit. Available in multiple colors.', price: 3499, costPrice: 1200, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500', featured: true, categoryId: categories[0].id, supplierId: supplier.id },
    { name: 'Floral Summer Dress', slug: 'floral-summer-dress', description: 'Lightweight floral print dress perfect for warm weather. Flattering A-line cut.', price: 2999, costPrice: 900, stock: 60, imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500', featured: true, categoryId: categories[1].id, supplierId: supplier.id },
    { name: 'Air Max Running Sneakers', slug: 'air-max-running-sneakers', description: 'Lightweight running shoes with responsive cushioning and breathable mesh upper.', price: 7999, costPrice: 3500, stock: 35, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', featured: true, categoryId: categories[2].id, supplierId: supplier.id },
    { name: 'Leather Derby Shoes', slug: 'leather-derby-shoes', description: 'Handcrafted genuine leather derby shoes. Classic design for formal occasions.', price: 5999, costPrice: 2200, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=500', featured: false, categoryId: categories[3].id, supplierId: supplier.id },
    { name: 'Canvas Crossbody Bag', slug: 'canvas-crossbody-bag', description: 'Stylish canvas crossbody bag with adjustable strap. Multiple compartments.', price: 1799, costPrice: 600, stock: 80, imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500', featured: false, categoryId: categories[4].id, supplierId: supplier.id },
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
