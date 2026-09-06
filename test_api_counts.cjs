const http = require('http');

const endpoints = [
  { name: 'Products', path: '/api/products' },
  { name: 'Contacts', path: '/api/contacts' },
  { name: 'Sales Orders', path: '/api/sales-orders' },
  { name: 'Purchase Orders', path: '/api/purchase-orders' },
  { name: 'Customer Invoices', path: '/api/invoices' },
  { name: 'Vendor Bills', path: '/api/vendor-bills' },
  { name: 'Payments', path: '/api/payments' },
  { name: 'Journal Entries', path: '/api/journal-entries' },
  { name: 'Budgets', path: '/api/budgets' }
];

async function checkEndpoint(ep) {
  return new Promise((resolve) => {
    const loginData = JSON.stringify({ email: 'admin@urbanfurniture.in', password: 'Password@123' });
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data).data.token);
        } catch(e) { resolve(''); }
      });
    });
    req.write(loginData);
    req.end();
  });
}

async function run() {
  const token = await checkEndpoint({});
  if (!token) return console.log('No token');
  
  for (const ep of endpoints) {
    await new Promise((resolve) => {
      http.get({
        hostname: 'localhost', port: 5000, path: ep.path, headers: { 'Authorization': 'Bearer ' + token }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            const dataLen = json.data ? json.data.length : 0;
            const total = json.pagination ? json.pagination.total : dataLen;
            console.log(`API ${ep.name}: Status ${res.statusCode} | DB Total: ${total} | Loaded into Frontend JSON Array: ${dataLen}`);
          } catch(e) { console.log(`API ${ep.name}: Error parse`); }
          resolve();
        });
      });
    });
  }
}
run();
