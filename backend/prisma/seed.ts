import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Urban Furniture Accounting ERP database...');

  // 1. Password Hashing
  const passwordHash = await bcrypt.hash('Password@123', 10);

  // 2. Seed Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@urbanfurniture.in' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@urbanfurniture.in',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const accountantUser = await prisma.user.upsert({
    where: { email: 'accountant@urbanfurniture.in' },
    update: {},
    create: {
      name: 'Senior Accountant',
      email: 'accountant@urbanfurniture.in',
      passwordHash,
      role: 'ACCOUNTANT',
    },
  });

  // 3. Seed Contacts
  const contactsData = [
    {
      id: 'CUST-001',
      name: 'Nimesh Pathak',
      type: 'CUSTOMER' as const,
      email: 'nimesh.pathak@example.com',
      phone: '+91 98250 12345',
      address: '402 Sunrise Heights, SG Highway',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380054',
      totalSales: 175000,
      paidSales: 150000,
      unpaidSales: 25000,
      outstanding: 25000,
    },
    {
      id: 'VEND-001',
      name: 'Azure Furniture',
      type: 'VENDOR' as const,
      email: 'contact@azurefurniture.com',
      phone: '+91 98980 67890',
      address: 'Plot 45, GIDC Industrial Estate',
      city: 'Surat',
      state: 'Gujarat',
      pincode: '395003',
      totalPurchases: 450000,
      paidPurchases: 380000,
      unpaidPurchases: 70000,
      outstanding: 70000,
    },
    {
      id: 'CUST-002',
      name: 'Rajesh Shah',
      type: 'CUSTOMER' as const,
      email: 'rajesh.shah@shahspace.in',
      phone: '+91 97129 44332',
      address: '12 Corporate Park, Prahlad Nagar',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380015',
      totalSales: 320000,
      paidSales: 320000,
      unpaidSales: 0,
      outstanding: 0,
    },
    {
      id: 'VEND-002',
      name: 'WoodCraft Industries',
      type: 'VENDOR' as const,
      email: 'sales@woodcraftind.com',
      phone: '+91 94260 11223',
      address: '88 Timber Market',
      city: 'Vadodara',
      state: 'Gujarat',
      pincode: '390001',
      totalPurchases: 280000,
      paidPurchases: 200000,
      unpaidPurchases: 80000,
      outstanding: 80000,
    },
  ];

  for (const c of contactsData) {
    await prisma.contact.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    });
  }

  // Seed Portal User linked to Nimesh Pathak
  await prisma.user.upsert({
    where: { email: 'nimesh.pathak@example.com' },
    update: { contactId: 'CUST-001' },
    create: {
      name: 'Nimesh Pathak',
      email: 'nimesh.pathak@example.com',
      passwordHash,
      role: 'CONTACT',
      contactId: 'CUST-001',
    },
  });

  // 4. Seed Products
  const productsData = [
    {
      id: 'PROD-001',
      name: 'Office Chair',
      type: 'GOODS' as const,
      category: 'Office Furniture',
      salesPrice: 5000,
      purchasePrice: 3200,
      taxRate: 18,
      sku: 'FURN-OC-001',
      description: 'Ergonomic mesh office chair with lumbar support.',
      salesCount: 142,
      purchaseCount: 200,
      currentStock: 140,
    },
    {
      id: 'PROD-002',
      name: 'Executive Chair',
      type: 'GOODS' as const,
      category: 'Office Furniture',
      salesPrice: 12500,
      purchasePrice: 8000,
      taxRate: 18,
      sku: 'FURN-EC-002',
      description: 'High-back premium leatherette executive chair.',
      salesCount: 65,
      purchaseCount: 100,
      currentStock: 80,
    },
    {
      id: 'PROD-003',
      name: 'Wooden Table',
      type: 'GOODS' as const,
      category: 'Home Furniture',
      salesPrice: 18000,
      purchasePrice: 11500,
      taxRate: 12,
      sku: 'FURN-WT-003',
      description: 'Solid teak wood study and dining multi-purpose table.',
      salesCount: 48,
      purchaseCount: 60,
      currentStock: 50,
    },
    {
      id: 'PROD-004',
      name: 'Executive Desk',
      type: 'GOODS' as const,
      category: 'Office Furniture',
      salesPrice: 35000,
      purchasePrice: 22000,
      taxRate: 18,
      sku: 'FURN-ED-004',
      description: 'L-shaped executive desk with built-in drawers.',
      salesCount: 30,
      purchaseCount: 45,
      currentStock: 35,
    },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }

  // 5. Seed Chart of Accounts
  const accountsData = [
    { id: 'ACC-101000', code: '101000', name: 'Cash', type: 'ASSET' as const, category: 'ASSETS', parentName: 'Current Assets', balance: 172000 },
    { id: 'ACC-102000', code: '102000', name: 'Bank - HDFC Account', type: 'ASSET' as const, category: 'ASSETS', parentName: 'Current Assets', balance: 400000 },
    { id: 'ACC-103000', code: '103000', name: 'Debtors (Accounts Receivable)', type: 'ASSET' as const, category: 'ASSETS', parentName: 'Current Assets', balance: 345000 },
    { id: 'ACC-104000', code: '104000', name: 'Inventory Asset Account', type: 'ASSET' as const, category: 'ASSETS', parentName: 'Current Assets', balance: 520000 },
    { id: 'ACC-201000', code: '201000', name: 'Creditors (Accounts Payable)', type: 'LIABILITY' as const, category: 'LIABILITIES', parentName: 'Current Liabilities', balance: 218000 },
    { id: 'ACC-202000', code: '202000', name: 'GST Payable', type: 'LIABILITY' as const, category: 'LIABILITIES', parentName: 'Current Liabilities', balance: 48000 },
    { id: 'ACC-301000', code: '301000', name: "Owner's Capital Account", type: 'CAPITAL' as const, category: 'CAPITAL', parentName: 'Equity', balance: 900000 },
    { id: 'ACC-401000', code: '401000', name: 'Sales Income', type: 'INCOME' as const, category: 'INCOME', parentName: 'Operating Income', balance: 1245000 },
    { id: 'ACC-402000', code: '402000', name: 'Services Income', type: 'INCOME' as const, category: 'INCOME', parentName: 'Operating Income', balance: 85000 },
    { id: 'ACC-501000', code: '501000', name: 'Purchase Expense (COGS)', type: 'EXPENSE' as const, category: 'EXPENSES', parentName: 'Operating Expenses', balance: 782000 },
    { id: 'ACC-502000', code: '502000', name: 'Logistics & Freight', type: 'EXPENSE' as const, category: 'EXPENSES', parentName: 'Operating Expenses', balance: 85000 },
    { id: 'ACC-503000', code: '503000', name: 'Rent & Electricity', type: 'EXPENSE' as const, category: 'EXPENSES', parentName: 'Operating Expenses', balance: 115000 },
  ];

  for (const acc of accountsData) {
    await prisma.account.upsert({
      where: { id: acc.id },
      update: acc,
      create: acc,
    });
  }

  // 6. Seed Journals
  const hdfcAcc = await prisma.account.findUnique({ where: { code: '102000' } });
  const cashAcc = await prisma.account.findUnique({ where: { code: '101000' } });
  const debtorsAcc = await prisma.account.findUnique({ where: { code: '103000' } });
  const creditorsAcc = await prisma.account.findUnique({ where: { code: '201000' } });

  const journalsData = [
    { id: 'JRNL-01', name: 'Sales Journal', code: 'SJ', type: 'SALES' as const, defaultAccountId: debtorsAcc?.id },
    { id: 'JRNL-02', name: 'Purchase Journal', code: 'PJ', type: 'PURCHASE' as const, defaultAccountId: creditorsAcc?.id },
    { id: 'JRNL-03', name: 'Bank Journal', code: 'BNK', type: 'BANK' as const, defaultAccountId: hdfcAcc?.id },
    { id: 'JRNL-04', name: 'Cash Journal', code: 'CSH', type: 'CASH' as const, defaultAccountId: cashAcc?.id },
  ];

  for (const j of journalsData) {
    await prisma.journal.upsert({
      where: { id: j.id },
      update: j,
      create: j,
    });
  }

  // 7. Seed Taxes
  const taxesData = [
    { id: 'TAX-01', name: 'GST 5%', rate: 5, account: '202000 - GST Payable' },
    { id: 'TAX-02', name: 'GST 12%', rate: 12, account: '202000 - GST Payable' },
    { id: 'TAX-03', name: 'GST 18%', rate: 18, account: '202000 - GST Payable' },
  ];

  for (const t of taxesData) {
    await prisma.tax.upsert({
      where: { id: t.id },
      update: t,
      create: t,
    });
  }

  // 8. Seed Analytic Accounts
  const analyticData = [
    { id: 'ANA-01', code: 'AA-FURN-OPS', name: 'Furniture Operations', responsible: 'Admin' },
    { id: 'ANA-02', code: 'AA-RETAIL-DIV', name: 'Retail Division', responsible: 'Nimesh Pathak' },
    { id: 'ANA-03', code: 'AA-OFF-FURN', name: 'Office Furniture', responsible: 'Admin' },
  ];

  for (const a of analyticData) {
    await prisma.analyticAccount.upsert({
      where: { id: a.id },
      update: a,
      create: a,
    });
  }

  // 9. Seed Budgets
  const budgetData = [
    {
      id: 'BDG-001',
      name: 'Furniture Purchase Budget',
      period: 'September 2026',
      periodStart: new Date('2026-09-01'),
      periodEnd: new Date('2026-09-30'),
      responsible: 'Admin',
      analyticAccountId: 'ANA-01',
      plannedAmount: 500000,
      achievedAmount: 320000,
      remainingAmount: 180000,
      utilization: 64,
    },
    {
      id: 'BDG-002',
      name: 'Retail Division Operations',
      period: 'Fiscal Year 2026-27',
      periodStart: new Date('2026-04-01'),
      periodEnd: new Date('2027-03-31'),
      responsible: 'Nimesh Pathak',
      analyticAccountId: 'ANA-02',
      plannedAmount: 1200000,
      achievedAmount: 480000,
      remainingAmount: 720000,
      utilization: 40,
    },
  ];

  for (const b of budgetData) {
    await prisma.budget.upsert({
      where: { id: b.id },
      update: b,
      create: b,
    });
  }

  console.log('✅ Urban Furniture Accounting ERP Database Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
