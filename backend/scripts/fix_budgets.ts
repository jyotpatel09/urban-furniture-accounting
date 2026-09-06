import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  await prisma.$connect();
  
  const defaultAnalytic = await prisma.analyticAccount.findFirst();
  if (!defaultAnalytic) return;

  const incomeExpAccounts = await prisma.account.findMany({
    where: { type: { in: ['INCOME', 'EXPENSE'] } }
  });

  const accountIds = incomeExpAccounts.map(a => a.id);

  const res = await prisma.journalEntryLine.updateMany({
    where: { accountId: { in: accountIds } },
    data: { analyticAccountId: defaultAnalytic.id }
  });

  console.log(`Updated ${res.count} Journal Entry Lines with Analytic Account ID for Budgets.`);
  process.exit(0);
}

run();
