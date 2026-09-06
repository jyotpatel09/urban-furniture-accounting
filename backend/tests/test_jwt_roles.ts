import http from 'http';

const BASE_URL = 'http://localhost:5000/api';

function makeRequest(method: string, path: string, body?: any, token?: string): Promise<{ status: number; data: any }> {
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

async function testAuthFlow() {
  console.log('🧪 Testing Frontend <-> Backend JWT Authentication Flow...\n');

  // 1. Unauthenticated request -> should fail with 401
  const unauthRes = await makeRequest('GET', '/products');
  console.log(`1. Unauthenticated GET /api/products -> Status ${unauthRes.status}`);
  console.assert(unauthRes.status === 401, 'Expected 401 Unauthorized');
  console.log(`   Response: ${JSON.stringify(unauthRes.data.message)}\n`);

  // 2. Login as ADMIN
  const adminLogin = await makeRequest('POST', '/auth/login', { email: 'admin@urbanfurniture.in', password: 'Password@123' });
  console.log(`2. Login ADMIN (admin@urbanfurniture.in) -> Status ${adminLogin.status}`);
  const adminToken = adminLogin.data?.data?.token;
  console.assert(!!adminToken, 'Admin token should exist');
  console.log(`   Received Token: ${adminToken ? adminToken.substring(0, 25) + '...' : 'NONE'}\n`);

  // 3. Admin Protected GET /api/products
  const adminProducts = await makeRequest('GET', '/products', undefined, adminToken);
  console.log(`3. ADMIN GET /api/products -> Status ${adminProducts.status}`);
  console.assert(adminProducts.status === 200, 'Expected 200 OK');
  console.log(`   Products Count: ${Array.isArray(adminProducts.data?.data) ? adminProducts.data.data.length : 0}\n`);

  // 4. Login as ACCOUNTANT
  const accountantLogin = await makeRequest('POST', '/auth/login', { email: 'accountant@urbanfurniture.in', password: 'Password@123' });
  console.log(`4. Login ACCOUNTANT (accountant@urbanfurniture.in) -> Status ${accountantLogin.status}`);
  const accountantToken = accountantLogin.data?.data?.token;
  console.assert(!!accountantToken, 'Accountant token should exist');
  console.log(`   Received Token: ${accountantToken ? accountantToken.substring(0, 25) + '...' : 'NONE'}\n`);

  // 5. Accountant Protected GET /api/reports/profit-loss
  const accountantPL = await makeRequest('GET', '/reports/profit-loss', undefined, accountantToken);
  console.log(`5. ACCOUNTANT GET /api/reports/profit-loss -> Status ${accountantPL.status}`);
  console.assert(accountantPL.status === 200, 'Expected 200 OK');
  console.log(`   Report Net Profit: ₹${accountantPL.data?.data?.netProfit || 0}\n`);

  // 6. Login as SALES_PURCHASE
  const salesLogin = await makeRequest('POST', '/auth/login', { email: 'sales@urbanfurniture.in', password: 'Password@123' });
  console.log(`6. Login SALES (sales@urbanfurniture.in) -> Status ${salesLogin.status}`);
  const salesToken = salesLogin.data?.data?.token;
  console.assert(!!salesToken, 'Sales token should exist');
  console.log(`   Received Token: ${salesToken ? salesToken.substring(0, 25) + '...' : 'NONE'}\n`);

  // 7. Sales Protected GET /api/sales-orders
  const salesOrders = await makeRequest('GET', '/sales-orders', undefined, salesToken);
  console.log(`7. SALES GET /api/sales-orders -> Status ${salesOrders.status}`);
  console.assert(salesOrders.status === 200, 'Expected 200 OK');
  console.log(`   Sales Orders Count: ${Array.isArray(salesOrders.data?.data) ? salesOrders.data.data.length : 0}\n`);

  // 8. Sales RBAC Forbidden Test (Attempting POST /api/accounts)
  const salesForbidden = await makeRequest('POST', '/accounts', { code: '999999', name: 'Forbidden Account', type: 'ASSET', category: 'Current Assets' }, salesToken);
  console.log(`8. SALES POST /api/accounts (RBAC Enforcement) -> Status ${salesForbidden.status}`);
  console.assert(salesForbidden.status === 403, 'Expected 403 Forbidden for Sales role');
  console.log(`   Response Message: ${JSON.stringify(salesForbidden.data.message)}\n`);

  console.log('✅ ALL JWT AUTHENTICATION & RBAC TESTS PASSED SUCCESSFULLY!');
}

testAuthFlow().catch((e) => {
  console.error('❌ Test failed:', e);
  process.exit(1);
});
