// Run with: node src/prisma/migrate-categories.js
// ============================================================
// Creates the new clothing/shoes categories and optionally
// reassigns products from old categories to new ones.
// Does NOT create sample products.
// ============================================================
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const { PrismaClient } = require('@prisma/client');
const readline = require('readline');
const prisma = new PrismaClient();

const NEW_CATEGORIES = [
  { name: "Men's Clothing",   slug: 'mens-clothing'   },
  { name: "Women's Clothing", slug: 'womens-clothing' },
  { name: 'Sneakers',         slug: 'sneakers'        },
  { name: 'Formal Shoes',     slug: 'formal-shoes'    },
  { name: 'Accessories',      slug: 'accessories'     },
];

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans.trim()); }));
}

async function main() {
  console.log('\n📦 TISH COLLECTION — Category Migration\n');

  // Step 1: Create new categories
  console.log('Step 1: Creating new categories...');
  const created = [];
  for (const cat of NEW_CATEGORIES) {
    const result = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    created.push(result);
    console.log(`  ✅ ${result.name} (${result.slug})`);
  }

  // Step 2: Check for old categories with products
  const allCategories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });

  const oldCategories = allCategories.filter(
    (c) => !NEW_CATEGORIES.some((nc) => nc.slug === c.slug) && c._count.products > 0
  );

  if (oldCategories.length === 0) {
    console.log('\nNo old categories with products found. Migration complete!');
    return;
  }

  // Step 3: Offer to reassign products
  console.log('\n───────────────────────────────────────');
  console.log('Old categories with products:');
  oldCategories.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.name} (${c.slug}) — ${c._count.products} product(s)`);
  });

  console.log('\nNew categories:');
  created.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.name} (${c.slug})`);
  });

  console.log('\n───────────────────────────────────────');
  const reassign = await ask('\nWould you like to reassign products from old categories to new ones? (y/n): ');

  if (reassign.toLowerCase() !== 'y') {
    console.log('\nSkipped reassignment. You can reassign products via the admin panel.');
    console.log('Old categories have been preserved.\n');
    return;
  }

  // Step 4: Reassign products interactively
  for (const oldCat of oldCategories) {
    console.log(`\n"${oldCat.name}" has ${oldCat._count.products} product(s).`);
    console.log('Assign them to:');
    created.forEach((c, i) => console.log(`  ${i + 1}. ${c.name}`));
    console.log(`  0. Skip (leave in "${oldCat.name}")`);

    const choice = await ask('Enter number: ');
    const idx = parseInt(choice) - 1;

    if (idx >= 0 && idx < created.length) {
      const updated = await prisma.product.updateMany({
        where: { categoryId: oldCat.id },
        data: { categoryId: created[idx].id },
      });
      console.log(`  ✅ Moved ${updated.count} product(s) to "${created[idx].name}"`);
    } else {
      console.log(`  ⏭️  Skipped "${oldCat.name}"`);
    }
  }

  // Step 5: Offer to delete empty old categories
  const deleteOld = await ask('\nDelete old categories that now have 0 products? (y/n): ');
  if (deleteOld.toLowerCase() === 'y') {
    for (const oldCat of oldCategories) {
      const remaining = await prisma.product.count({ where: { categoryId: oldCat.id } });
      if (remaining === 0) {
        await prisma.category.delete({ where: { id: oldCat.id } });
        console.log(`  🗑️  Deleted "${oldCat.name}"`);
      } else {
        console.log(`  ⏭️  Kept "${oldCat.name}" (still has ${remaining} product(s))`);
      }
    }
  }

  console.log('\n🎉 Migration complete!\n');
}

main()
  .catch((e) => { console.error('Migration failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
