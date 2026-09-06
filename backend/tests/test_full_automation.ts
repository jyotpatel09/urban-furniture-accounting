import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runAutomationCheck() {
  console.log('🤖 Running Automated PostgreSQL & Master Architecture Verification...\n');

  // 1. Programmatic Database Inspection
  const dbResult = await prisma.$queryRaw<Array<{ current_database: string }>>`SELECT current_database()`;
  const currentDb = dbResult[0]?.current_database;
  console.log(`1. Connected Database Name: "${currentDb}"`);
  console.assert(currentDb === 'urban_furniture', 'Database name must be urban_furniture');

  // 2. Inspect Table Row Counts
  const [usersCount, contactsCount, productsCount, accountsCount, journalsCount] = await Promise.all([
    prisma.user.count(),
    prisma.contact.count(),
    prisma.product.count(),
    prisma.account.count(),
    prisma.journal.count(),
  ]);

  console.log(`2. Database Tables Record Summary:`);
  console.log(`   - Users: ${usersCount}`);
  console.log(`   - Contacts: ${contactsCount}`);
  console.log(`   - Products: ${productsCount}`);
  console.log(`   - Accounts: ${accountsCount}`);
  console.log(`   - Journals: ${journalsCount}\n`);

  // 3. Test End-to-End Product CRUD in PostgreSQL
  console.log('3. Testing Product CRUD operations in PostgreSQL...');
  const testProduct = await prisma.product.create({
    data: {
      name: 'DATABASE-AUTOMATION-TEST',
      type: 'GOODS',
      category: 'Office Furniture',
      salesPrice: 15000,
      purchasePrice: 9500,
      taxRate: 18,
      sku: `FURN-AUTO-${Date.now().toString().slice(-4)}`,
      description: 'Automated database test product record',
    },
  });
  console.log(`   ✅ Created Product ID: ${testProduct.id}`);

  const readProduct = await prisma.product.findUnique({ where: { id: testProduct.id } });
  console.assert(readProduct?.name === 'DATABASE-AUTOMATION-TEST', 'Read product must match created');
  console.log(`   ✅ Verified Read Product from PostgreSQL: ${readProduct?.name}`);

  await prisma.product.delete({ where: { id: testProduct.id } });
  console.log(`   ✅ Cleaned up Test Product ID: ${testProduct.id}\n`);

  // 4. Test End-to-End Contact CRUD in PostgreSQL
  console.log('4. Testing Contact CRUD operations in PostgreSQL...');
  const testContact = await prisma.contact.create({
    data: {
      name: 'DATABASE-AUTOMATION-CONTACT',
      type: 'CUSTOMER',
      email: `auto.contact.${Date.now()}@example.com`,
      phone: '+91 99999 88888',
      address: '100 Automation Way',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380001',
    },
  });
  console.log(`   ✅ Created Contact ID: ${testContact.id}`);

  const readContact = await prisma.contact.findUnique({ where: { id: testContact.id } });
  console.assert(readContact?.name === 'DATABASE-AUTOMATION-CONTACT', 'Read contact must match created');
  console.log(`   ✅ Verified Read Contact from PostgreSQL: ${readContact?.name}`);

  await prisma.contact.delete({ where: { id: testContact.id } });
  console.log(`   ✅ Cleaned up Test Contact ID: ${testContact.id}\n`);

  console.log('🎉 PROGRAMMATIC POSTGRESQL VERIFICATION SUCCESSFUL!');
}

runAutomationCheck()
  .catch((err) => {
    console.error('❌ Programmatic verification failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
