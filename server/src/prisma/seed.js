// Run with: node src/prisma/seed.js
// Updates categories and admin credentials for Tish Collection fashion store
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const ADMIN_NAME     = process.env.ADMIN_NAME     || 'Tish Admin';
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@tishcollection.store';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@1234';
const ADMIN_PHONE    = process.env.ADMIN_PHONE    || '+254700000000';

async function main() {
  console.log('🌱 Seeding Tish Collection database...');

  // Create/update admin
  const adminPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const admin = await prisma.user.upsert({
    where:  { email: ADMIN_EMAIL },
    update: { password: adminPassword, name: ADMIN_NAME },
    create: {
      email:      ADMIN_EMAIL,
      password:   adminPassword,
      name:       ADMIN_NAME,
      phone:      ADMIN_PHONE,
      role:       'ADMIN',
      isVerified: true,
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // Fashion categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'ladies-fashion' }, update: {}, create: { name: "Ladies Fashion", slug: 'ladies-fashion' } }),
    prisma.category.upsert({ where: { slug: 'mens-fashion'   }, update: {}, create: { name: "Men's Fashion",  slug: 'mens-fashion'   } }),
    prisma.category.upsert({ where: { slug: 'shoes'          }, update: {}, create: { name: 'Shoes',          slug: 'shoes'          } }),
    prisma.category.upsert({ where: { slug: 'accessories'    }, update: {}, create: { name: 'Accessories',    slug: 'accessories'    } }),
    prisma.category.upsert({ where: { slug: 'kids-fashion'   }, update: {}, create: { name: "Kids Fashion",   slug: 'kids-fashion'   } }),
  ]);
  console.log('✅ Fashion categories created');

  // Supplier
  const supplier = await prisma.supplier.upsert({
    where:  { email: 'supplier@tishcollection.store' },
    update: {},
    create: {
      name:    'Tish Collection Supplier',
      email:   'supplier@tishcollection.store',
      country: 'Kenya',
    },
  });

  console.log('\n🎉 Done! Admin login:');
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log('\n📝 Fashion categories created:');
  categories.forEach((c) => console.log(`   - ${c.name} (${c.slug})`));
  console.log('\n👗 Now add your products from the admin dashboard!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
