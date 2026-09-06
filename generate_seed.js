const fs = require('fs');

const seedContent = import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function sfc32(a, b, c, d) {
  return function() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
    let t = (a + b) | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    d = d + 1 | 0;
    t = t + d | 0;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}
const rand = sfc32(1234, 5678, 9012, 3456);

function randomInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function randomElement(arr) {
  return arr[randomInt(0, arr.length - 1)];
}
function randomDate(startMonthsAgo, endMonthsAgo) {
  const d = new Date();
  d.setMonth(d.getMonth() - randomInt(endMonthsAgo, startMonthsAgo));
  d.setDate(randomInt(1, 28));
  return d;
}
function generateUnique(prefix, num) {
  return \\\\\\-\\\\\\;
}

async function main() {
  console.log('?? Starting Urban Furniture ERP Demo Data Seeding...');

  // 1. Core Users (Preserving existing)
  const passwordHash = await bcrypt.hash('Password@123', 10);
  const users = [
    { email: 'admin@urbanfurniture.in', name: 'Admin User', role: 'ADMIN' },
    { email: 'accountant@urbanfurniture.in', name: 'Accountant User', role: 'ACCOUNTANT' },
    { email: 'sales@urbanfurniture.in', name: 'Sales/Purchase User', role: 'SALES_PURCHASE' }
  ];
  let adminId = null;
  for (const u of users) {
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { name: u.name, email: u.email, passwordHash, role: u.role }
    });
    if (u.role === 'ADMIN') adminId = created.id;
  }
  
  // 2. Chart of Accounts
  const accountDefs = [
    { code: '101000', name: 'Cash', type: 'ASSET', category: 'ASSETS' },
    { code: '102000', name: 'Bank - HDFC Account', type: 'ASSET', category: 'ASSETS' },
    { code: '103000', name: 'Debtors (Accounts Receivable)', type: 'ASSET', category: 'ASSETS' },
    { code: '104000', name: 'Inventory Asset Account', type: 'ASSET', category: 'ASSETS' },
    { code: '201000', name: 'Creditors (Accounts Payable)', type: 'LIABILITY', category: 'LIABILITIES' },
    { code: '202000', name: 'Output GST', type: 'LIABILITY', category: 'LIABILITIES' },
    { code: '202001', name: 'Input GST', type: 'ASSET', category: 'ASSETS' },
    { code: '301000', name: 'Owner\\'s Capital Account', type: 'CAPITAL', category: 'CAPITAL' },
    { code: '401000', name: 'Sales Revenue', type: 'INCOME', category: 'INCOME' },
    { code: '501000', name: 'Purchases', type: 'EXPENSE', category: 'EXPENSES' },
    { code: '502000', name: 'Operating Expenses', type: 'EXPENSE', category: 'EXPENSES' },
  ];
  
  for (const acc of accountDefs) {
    await prisma.account.upsert({
      where: { code: acc.code },
      update: {},
      create: { ...acc, balance: 0, parentName: acc.category }
    });
  }
  
  // Get main accounts for accounting
  const accounts = await prisma.account.findMany();
  const getAccId = (code) => accounts.find(a => a.code === code)?.id;
  
  // 3. Journals
  const journalsData = [
    { code: 'SJ', name: 'Sales Journal', type: 'SALES', defaultAccountId: getAccId('103000') },
    { code: 'PJ', name: 'Purchase Journal', type: 'PURCHASE', defaultAccountId: getAccId('201000') },
    { code: 'BNK', name: 'Bank Journal', type: 'BANK', defaultAccountId: getAccId('102000') },
    { code: 'CSH', name: 'Cash Journal', type: 'CASH', defaultAccountId: getAccId('101000') },
    { code: 'GEN', name: 'General Journal', type: 'GENERAL', defaultAccountId: null }
  ];
  for (const j of journalsData) {
    await prisma.journal.upsert({
      where: { code: j.code },
      update: {},
      create: { ...j }
    });
  }
  const journals = await prisma.journal.findMany();
  const getJnlId = (code) => journals.find(j => j.code === code)?.id;
  
  // 4. Taxes
  await prisma.tax.upsert({
    where: { id: 'TAX-03' },
    update: {},
    create: { id: 'TAX-03', name: 'GST 18%', rate: 18, account: '202000 - Output GST' }
  });

  // 5. Contacts (20 Customers, 10 Vendors)
  const contactNamesCust = [
    'Shree Infrastructure Pvt Ltd', 'Patel Technologies', 'Ahmedabad Corporate Solutions',
    'Gujarat Business Hub', 'Sunrise Industries', 'Reliance Retail', 'Adani Enterprises',
    'Zydus Lifesciences', 'Torrent Power', 'Nirma Limited', 'Symphony Limited',
    'Arvind Fashions', 'KHS Machinery', 'Intas Pharmaceuticals', 'Cadila Healthcare',
    'Tata Motors Sales', 'L&T Construction', 'Godrej Properties', 'Wipro Limited', 'Infosys Regional'
  ];
  const contactNamesVend = [
    'WoodCraft Industries', 'Jyot PVT LTD', 'Gujarat Furniture Supplies', 'Premium Hardware Suppliers',
    'Asian Paints', 'Century Plyboards', 'Greenlam Industries', 'Merino Laminates',
    'Hettich India', 'Hafele Hardware'
  ];
  
  let createdCustomers = [];
  for (let i = 0; i < contactNamesCust.length; i++) {
    const id = generateUnique('DEMO-CUST', i + 1);
    const c = await prisma.contact.upsert({
      where: { id },
      update: {},
      create: {
        id,
        name: contactNamesCust[i],
        email: \\\contact\\\@\\\.com\\\,
        phone: '+91 9' + randomInt(100000000, 999999999),
        city: randomElement(['Ahmedabad', 'Vadodara', 'Surat', 'Rajkot', 'Mumbai', 'Pune', 'Delhi', 'Bengaluru']),
        state: 'Gujarat',
        type: 'CUSTOMER',
      }
    });
    createdCustomers.push(c);
  }
  let createdVendors = [];
  for (let i = 0; i < contactNamesVend.length; i++) {
    const id = generateUnique('DEMO-VEND', i + 1);
    const v = await prisma.contact.upsert({
      where: { id },
      update: {},
      create: {
        id,
        name: contactNamesVend[i],
        email: \\\sales@\\\.com\\\,
        phone: '+91 8' + randomInt(100000000, 999999999),
        city: randomElement(['Ahmedabad', 'Vadodara', 'Surat', 'Mumbai', 'Delhi']),
        state: 'Gujarat',
        type: 'VENDOR',
      }
    });
    createdVendors.push(v);
  }

  // 6. Products (30)
  const productBases = [
    { n: 'Executive Desk', p: 25000, c: 15000 }, { n: 'Executive Desk Pro', p: 45000, c: 28000 },
    { n: 'Office Chair', p: 5500, c: 3000 }, { n: 'Ergonomic Office Chair', p: 12500, c: 7500 },
    { n: 'Conference Table', p: 55000, c: 32000 }, { n: 'Reception Desk', p: 35000, c: 20000 },
    { n: 'Filing Cabinet', p: 8500, c: 5000 }, { n: 'Storage Cabinet', p: 11000, c: 6500 },
    { n: 'Workstation', p: 18000, c: 10000 }, { n: 'Modular Workstation', p: 22000, c: 13000 },
    { n: 'Visitor Chair', p: 3500, c: 2000 }, { n: 'Meeting Table', p: 15000, c: 9000 },
    { n: 'Bookshelf', p: 9500, c: 5500 }, { n: 'Sofa', p: 28000, c: 16000 },
    { n: 'Reception Sofa', p: 32000, c: 18000 }, { n: 'Computer Table', p: 6500, c: 3500 },
    { n: 'Pedestal Drawer', p: 4500, c: 2500 }, { n: 'Wooden Desk', p: 14000, c: 8000 },
    { n: 'Glass Conference Table', p: 65000, c: 40000 }, { n: 'Office Partition', p: 12000, c: 7000 },
    { n: 'Cafeteria Table', p: 7500, c: 4000 }, { n: 'Cafeteria Chair', p: 2500, c: 1200 },
    { n: 'Manager Desk', p: 28000, c: 16000 }, { n: 'Lounge Chair', p: 14000, c: 8000 },
    { n: 'Standing Desk', p: 22000, c: 14000 }, { n: 'Whiteboard', p: 3000, c: 1500 },
    { n: 'Notice Board', p: 1500, c: 700 }, { n: 'Shoe Rack', p: 4000, c: 2000 },
    { n: 'Credenza', p: 16000, c: 9000 }, { n: 'Training Room Table', p: 8000, c: 4500 }
  ];
  let createdProducts = [];
  for (let i = 0; i < productBases.length; i++) {
    const sku = generateUnique('DEMO-PRD', i + 1);
    const p = await prisma.product.upsert({
      where: { sku },
      update: {},
      create: {
        name: productBases[i].n,
        sku,
        category: 'Office Furniture',
        type: 'GOODS',
        salesPrice: productBases[i].p,
        purchasePrice: productBases[i].c,
        taxRate: 18,
        description: \\\High quality \\\\\\,
        currentStock: randomInt(10, 100),
      }
    });
    createdProducts.push(p);
  }

  // Common Journal Entry Generator
  async function createJE(date, journalId, ref, lines) {
    const jeNum = generateUnique('DEMO-JE', randomInt(1000, 999999));
    let totalDebit = 0;
    let totalCredit = 0;
    for (const l of lines) {
      totalDebit += l.debit;
      totalCredit += l.credit;
    }
    return await prisma.journalEntry.create({
      data: {
        number: jeNum,
        journalId,
        date,
        reference: ref,
        status: 'POSTED',
        totalDebit,
        totalCredit,
        createdById: adminId,
        lines: {
          create: lines.map(l => ({
            accountId: l.accountId,
            debit: l.debit,
            credit: l.credit,
            description: l.description
          }))
        }
      }
    });
  }

  // 7. Purchase Orders (25) -> Bills -> Payments -> JE
  console.log('?? Seeding Purchase Orders, Bills, Payments and Journals...');
  for (let i = 0; i < 25; i++) {
    const number = generateUnique('DEMO-PO', i + 1);
    const existing = await prisma.purchaseOrder.findUnique({ where: { number } });
    if (existing) continue;

    const vendor = randomElement(createdVendors);
    const date = randomDate(1, 10);
    const itemsCount = randomInt(1, 5);
    
    let subtotal = 0;
    let taxAmount = 0;
    const items = [];
    for (let j = 0; j < itemsCount; j++) {
      const prod = randomElement(createdProducts);
      const qty = randomInt(5, 20);
      const unitPrice = parseFloat(prod.purchasePrice);
      const lineSub = qty * unitPrice;
      const lineTax = lineSub * 0.18;
      subtotal += lineSub;
      taxAmount += lineTax;
      items.push({
        productId: prod.id,
        quantity: qty,
        unitPrice,
        taxRate: 18,
        taxAmount: lineTax,
        lineSubtotal: lineSub,
        lineTotal: lineSub + lineTax
      });
    }
    const totalAmount = subtotal + taxAmount;
    
    const po = await prisma.purchaseOrder.create({
      data: {
        number,
        vendorId: vendor.id,
        date,
        status: 'RECEIVED',
        billStatus: 'Billed',
        subtotal,
        taxAmount,
        totalAmount,
        createdById: adminId,
        items: { create: items }
      }
    });

    // Create Vendor Bill
    const billNum = generateUnique('DEMO-BILL', i + 1);
    const billDate = new Date(date.getTime() + 86400000 * 2); // 2 days later
    const bill = await prisma.vendorBill.create({
      data: {
        number: billNum,
        vendorId: vendor.id,
        purchaseOrderId: po.id,
        billDate,
        dueDate: new Date(billDate.getTime() + 86400000 * 15),
        status: 'PAID',
        subtotal,
        taxAmount,
        totalAmount,
        paidAmount: totalAmount,
        remainingAmount: 0,
        createdById: adminId,
        items: { create: items.map(it => ({...it})) }
      }
    });

    // Bill Journal Entry
    const billJe = await createJE(billDate, getJnlId('PJ'), billNum, [
      { accountId: getAccId('501000'), debit: subtotal, credit: 0, description: \\\Purchase \\\\\\ },
      { accountId: getAccId('202001'), debit: taxAmount, credit: 0, description: \\\Input GST \\\\\\ },
      { accountId: getAccId('201000'), debit: 0, credit: totalAmount, description: \\\Vendor Payable \\\\\\ }
    ]);
    await prisma.vendorBill.update({ where: { id: bill.id }, data: { journalEntryId: billJe.id } });

    // Create Payment
    const payNum = generateUnique('DEMO-PAY-V', i + 1);
    const payDate = new Date(billDate.getTime() + 86400000 * 5); // 5 days later
    const payment = await prisma.payment.create({
      data: {
        number: payNum,
        paymentDate: payDate,
        amount: totalAmount,
        method: 'BANK',
        vendorId: vendor.id,
        vendorBillId: bill.id,
        status: 'POSTED',
        createdById: adminId,
        reference: \\\Pay for \\\\\\
      }
    });

    // Payment Journal Entry
    const payJe = await createJE(payDate, getJnlId('BNK'), payNum, [
      { accountId: getAccId('201000'), debit: totalAmount, credit: 0, description: \\\Payment to \\\\\\ },
      { accountId: getAccId('102000'), debit: 0, credit: totalAmount, description: \\\Bank Payment \\\\\\ }
    ]);
    await prisma.payment.update({ where: { id: payment.id }, data: { journalEntryId: payJe.id } });
  }

  // 8. Sales Orders (30) -> Invoices -> Payments -> JE
  console.log('?? Seeding Sales Orders, Invoices, Payments and Journals...');
  for (let i = 0; i < 30; i++) {
    const number = generateUnique('DEMO-SO', i + 1);
    const existing = await prisma.salesOrder.findUnique({ where: { number } });
    if (existing) continue;

    const cust = randomElement(createdCustomers);
    const date = randomDate(1, 10);
    const itemsCount = randomInt(1, 5);
    
    let subtotal = 0;
    let taxAmount = 0;
    const items = [];
    for (let j = 0; j < itemsCount; j++) {
      const prod = randomElement(createdProducts);
      const qty = randomInt(2, 10);
      const unitPrice = parseFloat(prod.salesPrice);
      const lineSub = qty * unitPrice;
      const lineTax = lineSub * 0.18;
      subtotal += lineSub;
      taxAmount += lineTax;
      items.push({
        productId: prod.id,
        quantity: qty,
        unitPrice,
        taxRate: 18,
        taxAmount: lineTax,
        lineSubtotal: lineSub,
        lineTotal: lineSub + lineTax
      });
    }
    const totalAmount = subtotal + taxAmount;
    
    const so = await prisma.salesOrder.create({
      data: {
        number,
        customerId: cust.id,
        date,
        status: 'CONFIRMED',
        paymentStatus: 'Paid',
        subtotal,
        taxAmount,
        totalAmount,
        createdById: adminId,
        items: { create: items }
      }
    });

    // Create Invoice
    const invNum = generateUnique('DEMO-INV', i + 1);
    const invDate = new Date(date.getTime() + 86400000 * 3); // 3 days later
    const inv = await prisma.invoice.create({
      data: {
        number: invNum,
        customerId: cust.id,
        salesOrderId: so.id,
        invoiceDate: invDate,
        dueDate: new Date(invDate.getTime() + 86400000 * 15),
        status: 'PAID',
        subtotal,
        taxAmount,
        totalAmount,
        paidAmount: totalAmount,
        remainingAmount: 0,
        createdById: adminId,
        items: { create: items.map(it => ({...it})) }
      }
    });

    // Invoice Journal Entry
    const invJe = await createJE(invDate, getJnlId('SJ'), invNum, [
      { accountId: getAccId('103000'), debit: totalAmount, credit: 0, description: \\\Receivable from \\\\\\ },
      { accountId: getAccId('401000'), debit: 0, credit: subtotal, description: \\\Sales Revenue \\\\\\ },
      { accountId: getAccId('202000'), debit: 0, credit: taxAmount, description: \\\Output GST \\\\\\ }
    ]);
    await prisma.invoice.update({ where: { id: inv.id }, data: { journalEntryId: invJe.id } });

    // Create Payment
    const payNum = generateUnique('DEMO-PAY-C', i + 1);
    const payDate = new Date(invDate.getTime() + 86400000 * 7); // 7 days later
    const payment = await prisma.payment.create({
      data: {
        number: payNum,
        paymentDate: payDate,
        amount: totalAmount,
        method: 'BANK',
        customerId: cust.id,
        invoiceId: inv.id,
        status: 'POSTED',
        createdById: adminId,
        reference: \\\Recpt for \\\\\\
      }
    });

    // Payment Journal Entry
    const payJe = await createJE(payDate, getJnlId('BNK'), payNum, [
      { accountId: getAccId('102000'), debit: totalAmount, credit: 0, description: \\\Bank Receipt \\\\\\ },
      { accountId: getAccId('103000'), debit: 0, credit: totalAmount, description: \\\Receipt from \\\\\\ }
    ]);
    await prisma.payment.update({ where: { id: payment.id }, data: { journalEntryId: payJe.id } });
  }
  
  // 9. Budgets (5)
  for (let i = 0; i < 5; i++) {
    const id = \\\DEMO-BUDGET-\\\\\\;
    await prisma.budget.upsert({
      where: { id },
      update: {},
      create: {
        id,
        name: \\\Demo Budget Q\\\\\\,
        period: \\\Quarter \\\\\\,
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + 86400000 * 90),
        responsible: 'Admin',
        plannedAmount: 500000,
        achievedAmount: 200000,
        remainingAmount: 300000,
        utilization: 40
      }
    });
  }

  console.log('? Urban Furniture ERP Database Demo Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('? Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.();
  });

fs.writeFileSync('backend/prisma/seed.ts', seedContent);
console.log('Seed file written to backend/prisma/seed.ts');
