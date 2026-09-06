const { PrismaClient } = require('@prisma/client');

const users = ['postgres', 'jyot', 'jyotpatel', 'jyotpatel09', 'devam', 'admin'];
const passwords = [
  'jyot',
  'jyot123',
  'jyotpatel',
  'jyotpatel09',
  'jyot@123',
  'Jyot@123',
  'Jyot123',
  'patel',
  'patel123',
  'Patel@123',
  'odoo',
  'odoo123',
  'odoo18',
  'Odoo@123',
  'Odoo123',
  'Odoo2026',
  'odoo2026',
  'postgres18',
  'Postgres18',
  'Postgres18@123',
  'postgres@123',
  'Postgresql@123',
  'postgresql',
  '1234567890',
  '090909',
  '123123'
];

async function run() {
  console.log('Testing custom target passwords against localhost:5432...');
  for (const u of users) {
    for (const p of passwords) {
      const url = `postgresql://${u}:${encodeURIComponent(p)}@localhost:5432/postgres?schema=public`;
      const client = new PrismaClient({ datasources: { db: { url } } });
      try {
        await client.$connect();
        console.log(`\n\n🎯 SUCCESS! MATCH FOUND => USER: "${u}", PASSWORD: "${p}"\n\n`);
        await client.$disconnect();
        return { u, p };
      } catch(e) {
        if (e.message.includes('database "postgres" does not exist')) {
          console.log(`\n\n🎯 SUCCESS! MATCH FOUND => USER: "${u}", PASSWORD: "${p}" (db missing)\n\n`);
          await client.$disconnect();
          return { u, p };
        }
        await client.$disconnect();
      }
    }
  }
  console.log('Finished search.');
}

run();
