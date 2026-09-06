import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.product.findUnique({ where: { sku: 'FURN-TEST-001' } });
  if (!existing) {
    const created = await prisma.product.create({
      data: {
        name: 'TEST-DATABASE-001',
        type: 'GOODS',
        category: 'Office Furniture',
        salesPrice: 9999,
        purchasePrice: 5000,
        taxRate: 18,
        sku: 'FURN-TEST-001',
        description: 'Real database record created for audit',
      },
    });
    console.log('CREATED_DB_RECORD:', created.id, created.name, created.sku);
  }

  const found = await prisma.product.findUnique({ where: { sku: 'FURN-TEST-001' } });
  console.log('POSTGRESQL_VERIFICATION_PASS:', found !== null);
  console.log('FOUND_RECORD:', JSON.stringify(found, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
