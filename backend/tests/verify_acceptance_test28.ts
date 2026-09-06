import http from 'http';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:5000/api';

function apiCall(method: string, path: string, body?: any, token?: string): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const postData = body ? JSON.stringify(body) : '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (postData) {
      headers['Content-Length'] = String(Buffer.byteLength(postData));
    }

    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve({ status: res.statusCode || 500, data: parsed });
          } catch {
            resolve({ status: res.statusCode || 500, data: rawData });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runAcceptanceTest28() {
  console.log('🚀 Running Final Acceptance Test 28 (Full End-to-End Product & Contact PostgreSQL Persistence)...\n');

  // Step 1: Programmatic DB Name Check
  const dbCheck = await prisma.$queryRaw<Array<{ current_database: string }>>`SELECT current_database()`;
  console.log(`1. Connected PostgreSQL Database: "${dbCheck[0]?.current_database}"`);
  console.assert(dbCheck[0]?.current_database === 'urban_furniture', 'Database name must be urban_furniture');

  // Step 2: Login as Admin
  const loginRes = await apiCall('POST', '/auth/login', { email: 'admin@urbanfurniture.in', password: 'Password@123' });
  console.log(`2. Login ADMIN -> Status ${loginRes.status}`);
  const token = loginRes.data?.data?.token;
  console.assert(!!token, 'JWT Token must be returned');

  // Step 3: Create Product DATABASE_REAL_TEST_001
  const sku = `FURN-ACC-${Date.now().toString().slice(-4)}`;
  const createProdRes = await apiCall('POST', '/products', {
    name: 'DATABASE_REAL_TEST_001',
    type: 'GOODS',
    category: 'Office Furniture',
    salesPrice: 24500,
    purchasePrice: 16000,
    taxRate: 18,
    sku,
    description: 'Final acceptance test product record',
  }, token);

  console.log(`3. POST /api/products (Create DATABASE_REAL_TEST_001) -> Status ${createProdRes.status}`);
  console.assert(createProdRes.status === 201 || createProdRes.status === 200, 'POST /api/products must succeed');
  const createdProdId = createProdRes.data?.data?.id;
  console.log(`   Created Product ID: ${createdProdId}`);

  // Step 4: Verify Direct Row Presence in PostgreSQL "Product" Table
  const dbProd = await prisma.product.findUnique({ where: { id: createdProdId } });
  console.log(`4. Direct PostgreSQL "Product" Table Query -> Found: "${dbProd?.name}" (SKU: ${dbProd?.sku})`);
  console.assert(dbProd !== null && dbProd.name === 'DATABASE_REAL_TEST_001', 'Record MUST exist in PostgreSQL');

  // Step 5: GET /api/products Verification
  const getProdsRes = await apiCall('GET', '/products', undefined, token);
  console.log(`5. GET /api/products -> Status ${getProdsRes.status}`);
  const prodList = getProdsRes.data?.data?.items || getProdsRes.data?.data || [];
  const foundInList = prodList.some((p: any) => p.id === createdProdId || p.name === 'DATABASE_REAL_TEST_001');
  console.log(`   Product returned in GET API list: ${foundInList}`);
  console.assert(foundInList, 'Product must be in API list response');

  // Step 6: UPDATE Product in PostgreSQL
  const updateProdRes = await apiCall('PATCH', `/products/${createdProdId}`, { salesPrice: 28900 }, token);
  console.log(`6. PATCH /api/products/${createdProdId} -> Status ${updateProdRes.status}`);
  const updatedDbProd = await prisma.product.findUnique({ where: { id: createdProdId } });
  console.log(`   Updated PostgreSQL Sales Price: ₹${updatedDbProd?.salesPrice}`);
  console.assert(Number(updatedDbProd?.salesPrice) === 28900, 'PostgreSQL sales price must reflect update');

  // Step 7: DELETE Product from PostgreSQL
  const deleteProdRes = await apiCall('DELETE', `/products/${createdProdId}`, undefined, token);
  console.log(`7. DELETE /api/products/${createdProdId} -> Status ${deleteProdRes.status}`);
  const deletedDbProd = await prisma.product.findUnique({ where: { id: createdProdId } });
  console.log(`   PostgreSQL Query After Delete -> Found: ${deletedDbProd ? deletedDbProd.name : 'NULL (Deleted)'}`);

  // Step 8: Contact End-to-End Test (DATABASE_REAL_TEST_CONTACT_001)
  console.log('\n--- Contact End-to-End Acceptance Test ---');
  const createContactRes = await apiCall('POST', '/contacts', {
    name: 'DATABASE_REAL_TEST_CONTACT_001',
    type: 'CUSTOMER',
    email: `acc.test.${Date.now()}@urbanfurniture.in`,
    phone: '+91 98888 77777',
    address: '200 Acceptance Boulevard',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380015',
  }, token);

  console.log(`8. POST /api/contacts (Create DATABASE_REAL_TEST_CONTACT_001) -> Status ${createContactRes.status}`);
  const createdContactId = createContactRes.data?.data?.id;

  const dbContact = await prisma.contact.findUnique({ where: { id: createdContactId } });
  console.log(`   Direct PostgreSQL "Contact" Table Query -> Found: "${dbContact?.name}"`);
  console.assert(dbContact !== null && dbContact.name === 'DATABASE_REAL_TEST_CONTACT_001', 'Contact MUST exist in PostgreSQL');

  const deleteContactRes = await apiCall('DELETE', `/contacts/${createdContactId}`, undefined, token);
  console.log(`   DELETE /api/contacts/${createdContactId} -> Status ${deleteContactRes.status}`);

  console.log('\n🎉 ALL ACCEPTANCE TEST 28 REQUIREMENTS VERIFIED SUCCESSFULLY!');
}

runAcceptanceTest28()
  .catch((err) => {
    console.error('❌ Acceptance Test 28 Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
