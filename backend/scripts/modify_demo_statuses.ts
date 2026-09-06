import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  await prisma.$connect();
  
  // Get all invoices
  const invoices = await prisma.invoice.findMany({ orderBy: { createdAt: 'desc' } });
  
  console.log(`Found ${invoices.length} invoices. Modifying them for realistic statuses...`);

  let count = 0;
  for (const inv of invoices) {
    count++;
    
    // Invoices 1-40: DRAFT (Zero paid, remaining = totalAmount, remove payments and JEs)
    if (count <= 40) {
      await prisma.payment.deleteMany({ where: { invoiceId: inv.id } });
      if (inv.journalEntryId) await prisma.journalEntry.deleteMany({ where: { id: inv.journalEntryId } });
      await prisma.invoice.update({
        where: { id: inv.id },
        data: {
          status: 'DRAFT',
          paidAmount: 0,
          remainingAmount: inv.totalAmount,
          journalEntryId: null
        }
      });
    }
    // Invoices 41-80: POSTED (Zero paid, remaining = totalAmount, remove payments)
    else if (count <= 80) {
      await prisma.payment.deleteMany({ where: { invoiceId: inv.id } });
      await prisma.invoice.update({
        where: { id: inv.id },
        data: {
          status: 'POSTED',
          paidAmount: 0,
          remainingAmount: inv.totalAmount
        }
      });
    }
    // Invoices 81-120: PARTIALLY_PAID
    else if (count <= 120) {
      const half = Number(inv.totalAmount) / 2;
      
      // Update the payment amount to half
      const payments = await prisma.payment.findMany({ where: { invoiceId: inv.id } });
      for (const p of payments) {
        await prisma.payment.update({ where: { id: p.id }, data: { amount: half } });
        // Update its JE
        if (p.journalEntryId) {
          await prisma.journalEntryLine.updateMany({
            where: { journalEntryId: p.journalEntryId, debit: Number(inv.totalAmount) },
            data: { debit: half }
          });
          await prisma.journalEntryLine.updateMany({
            where: { journalEntryId: p.journalEntryId, credit: Number(inv.totalAmount) },
            data: { credit: half }
          });
          await prisma.journalEntry.update({
            where: { id: p.journalEntryId },
            data: { totalDebit: half, totalCredit: half }
          });
        }
      }
      
      await prisma.invoice.update({
        where: { id: inv.id },
        data: {
          status: 'PARTIALLY_PAID',
          paidAmount: half,
          remainingAmount: Number(inv.totalAmount) - half
        }
      });
    }
    // Invoices 121-140: CANCELLED (Zero paid, remaining = totalAmount)
    else if (count <= 140) {
      await prisma.payment.deleteMany({ where: { invoiceId: inv.id } });
      if (inv.journalEntryId) await prisma.journalEntry.deleteMany({ where: { id: inv.journalEntryId } });
      await prisma.invoice.update({
        where: { id: inv.id },
        data: {
          status: 'CANCELLED',
          paidAmount: 0,
          remainingAmount: inv.totalAmount,
          journalEntryId: null
        }
      });
    }
    // The rest remain PAID
  }

  // Also modify a few Vendor Bills to match the statuses!
  const bills = await prisma.vendorBill.findMany({ orderBy: { createdAt: 'desc' } });
  let bCount = 0;
  for (const b of bills) {
    bCount++;
    if (bCount <= 30) {
      await prisma.payment.deleteMany({ where: { vendorBillId: b.id } });
      if (b.journalEntryId) await prisma.journalEntry.deleteMany({ where: { id: b.journalEntryId } });
      await prisma.vendorBill.update({
        where: { id: b.id },
        data: { status: 'DRAFT', paidAmount: 0, remainingAmount: b.totalAmount, journalEntryId: null }
      });
    } else if (bCount <= 60) {
      await prisma.payment.deleteMany({ where: { vendorBillId: b.id } });
      await prisma.vendorBill.update({
        where: { id: b.id },
        data: { status: 'POSTED', paidAmount: 0, remainingAmount: b.totalAmount }
      });
    } else if (bCount <= 80) {
      await prisma.payment.deleteMany({ where: { vendorBillId: b.id } });
      if (b.journalEntryId) await prisma.journalEntry.deleteMany({ where: { id: b.journalEntryId } });
      await prisma.vendorBill.update({
        where: { id: b.id },
        data: { status: 'CANCELLED', paidAmount: 0, remainingAmount: b.totalAmount, journalEntryId: null }
      });
    }
  }

  console.log('Database updated for realistic invoice and bill statuses!');
  process.exit(0);
}

run();
