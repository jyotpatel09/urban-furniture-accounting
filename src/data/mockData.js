export const initialContacts = [
  {
    id: 'CUST-001',
    name: 'Nimesh Pathak',
    type: 'Customer',
    email: 'nimesh.pathak@example.com',
    phone: '+91 98250 12345',
    address: '402 Sunrise Heights, SG Highway',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380054',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    totalSales: 175000,
    paidSales: 150000,
    unpaidSales: 250000,
    outstanding: 25000,
  },
  {
    id: 'VEND-001',
    name: 'Azure Furniture',
    type: 'Vendor',
    email: 'contact@azurefurniture.com',
    phone: '+91 98980 67890',
    address: 'Plot 45, GIDC Industrial Estate',
    city: 'Surat',
    state: 'Gujarat',
    pincode: '395003',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    totalPurchases: 450000,
    paidPurchases: 380000,
    unpaidPurchases: 70000,
    outstanding: 70000,
  },
  {
    id: 'CUST-002',
    name: 'Rajesh Shah',
    type: 'Customer',
    email: 'rajesh.shah@shahspace.in',
    phone: '+91 97129 44332',
    address: '12 Corporate Park, Prahlad Nagar',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380015',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    totalSales: 320000,
    paidSales: 320000,
    unpaidSales: 0,
    outstanding: 0,
  },
  {
    id: 'VEND-002',
    name: 'WoodCraft Industries',
    type: 'Vendor',
    email: 'sales@woodcraftind.com',
    phone: '+91 94260 11223',
    address: '88 Timber Market',
    city: 'Vadodara',
    state: 'Gujarat',
    pincode: '390001',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    totalPurchases: 280000,
    paidPurchases: 200000,
    unpaidPurchases: 80000,
    outstanding: 80000,
  },
  {
    id: 'CUST-003',
    name: 'Aarav Enterprises',
    type: 'Customer',
    email: 'info@aaraventerprises.com',
    phone: '+91 99099 88776',
    address: '701 Tech Tower, Salt Lake',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700091',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    totalSales: 450000,
    paidSales: 300000,
    unpaidSales: 150000,
    outstanding: 150000,
  },
  {
    id: 'VEND-003',
    name: 'OfficePro Suppliers',
    type: 'Vendor',
    email: 'support@officepro.in',
    phone: '+91 98220 55443',
    address: 'Building 3, MIDC Industrial Area',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411018',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    totalPurchases: 180000,
    paidPurchases: 180000,
    unpaidPurchases: 0,
    outstanding: 0,
  },
  {
    id: 'CUST-004',
    name: 'Modern Workspace Pvt Ltd',
    type: 'Both',
    email: 'procurement@modernworkspace.com',
    phone: '+91 91234 56789',
    address: '15 Financial District, Gachibowli',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500032',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    totalSales: 500000,
    paidSales: 350000,
    unpaidSales: 150000,
    totalPurchases: 120000,
    paidPurchases: 120000,
    unpaidPurchases: 0,
    outstanding: 150000,
  },
  {
    id: 'VEND-004',
    name: 'Furniture Hub',
    type: 'Vendor',
    email: 'orders@furniturehub.co.in',
    phone: '+91 98765 43210',
    address: '24 Wholesale Furniture Market',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400013',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    totalPurchases: 310000,
    paidPurchases: 240000,
    unpaidPurchases: 70000,
    outstanding: 70000,
  }
];

export const initialProducts = [
  {
    id: 'PROD-001',
    name: 'Office Chair',
    type: 'Goods',
    category: 'Office Furniture',
    salesPrice: 5000,
    purchasePrice: 3200,
    taxRate: 18,
    status: 'Active',
    sku: 'FURN-OC-001',
    description: 'Ergonomic mesh office chair with lumbar support and adjustable armrests.',
    salesCount: 142,
    purchaseCount: 200,
  },
  {
    id: 'PROD-002',
    name: 'Executive Chair',
    type: 'Goods',
    category: 'Office Furniture',
    salesPrice: 12500,
    purchasePrice: 8000,
    taxRate: 18,
    status: 'Active',
    sku: 'FURN-EC-002',
    description: 'High-back premium leatherette executive chair with tilt mechanism.',
    salesCount: 65,
    purchaseCount: 100,
  },
  {
    id: 'PROD-003',
    name: 'Wooden Table',
    type: 'Goods',
    category: 'Home Furniture',
    salesPrice: 18000,
    purchasePrice: 11500,
    taxRate: 12,
    status: 'Active',
    sku: 'FURN-WT-003',
    description: 'Solid teak wood study and dining multi-purpose table.',
    salesCount: 48,
    purchaseCount: 60,
  },
  {
    id: 'PROD-004',
    name: 'Executive Desk',
    type: 'Goods',
    category: 'Office Furniture',
    salesPrice: 35000,
    purchasePrice: 22000,
    taxRate: 18,
    status: 'Active',
    sku: 'FURN-ED-004',
    description: 'L-shaped executive desk with built-in drawers and cable management.',
    salesCount: 30,
    purchaseCount: 45,
  },
  {
    id: 'PROD-005',
    name: 'Conference Table',
    type: 'Goods',
    category: 'Office Furniture',
    salesPrice: 55000,
    purchasePrice: 36000,
    taxRate: 18,
    status: 'Active',
    sku: 'FURN-CT-005',
    description: '10-seater modular wooden conference table with connectivity box.',
    salesCount: 18,
    purchaseCount: 25,
  },
  {
    id: 'PROD-006',
    name: 'Office Sofa',
    type: 'Goods',
    category: 'Office Furniture',
    salesPrice: 28000,
    purchasePrice: 18500,
    taxRate: 12,
    status: 'Active',
    sku: 'FURN-OS-006',
    description: '3-seater reception sofa upholstered in durable commercial fabric.',
    salesCount: 24,
    purchaseCount: 35,
  },
  {
    id: 'PROD-007',
    name: 'Storage Cabinet',
    type: 'Goods',
    category: 'Office Furniture',
    salesPrice: 14000,
    purchasePrice: 9000,
    taxRate: 18,
    status: 'Active',
    sku: 'FURN-SC-007',
    description: 'Metal filing storage cabinet with lockable doors.',
    salesCount: 80,
    purchaseCount: 110,
  },
  {
    id: 'PROD-008',
    name: 'Dining Chair',
    type: 'Goods',
    category: 'Home Furniture',
    salesPrice: 4500,
    purchasePrice: 2800,
    taxRate: 12,
    status: 'Active',
    sku: 'FURN-DC-008',
    description: 'Cushioned wooden dining chair set component.',
    salesCount: 110,
    purchaseCount: 150,
  },
  {
    id: 'PROD-009',
    name: 'Furniture Assembly & Installation',
    type: 'Service',
    category: 'Services',
    salesPrice: 2500,
    purchasePrice: 1200,
    taxRate: 18,
    status: 'Active',
    sku: 'SERV-INST-009',
    description: 'On-site professional furniture assembly and setup service.',
    salesCount: 95,
    purchaseCount: 95,
  },
  {
    id: 'PROD-010',
    name: 'Complete Executive Setup Suite',
    type: 'Combo',
    category: 'Office Furniture',
    salesPrice: 85000,
    purchasePrice: 55000,
    taxRate: 18,
    status: 'Active',
    sku: 'CMBO-EXEC-010',
    description: 'Includes Executive Desk + Executive Chair + Storage Cabinet + Sofa.',
    salesCount: 12,
    purchaseCount: 15,
  }
];

export const initialChartOfAccounts = [
  // ASSETS
  { code: '101000', name: 'Cash', type: 'Asset', category: 'ASSETS', parent: 'Current Assets', balance: 172000, status: 'Active' },
  { code: '102000', name: 'Bank - HDFC Account', type: 'Asset', category: 'ASSETS', parent: 'Current Assets', balance: 400000, status: 'Active' },
  { code: '103000', name: 'Debtors (Accounts Receivable)', type: 'Asset', category: 'ASSETS', parent: 'Current Assets', balance: 345000, status: 'Active' },
  { code: '104000', name: 'Inventory Asset Account', type: 'Asset', category: 'ASSETS', parent: 'Current Assets', balance: 520000, status: 'Active' },
  
  // LIABILITIES
  { code: '201000', name: 'Creditors (Accounts Payable)', type: 'Liability', category: 'LIABILITIES', parent: 'Current Liabilities', balance: 218000, status: 'Active' },
  { code: '202000', name: 'GST Payable', type: 'Liability', category: 'LIABILITIES', parent: 'Current Liabilities', balance: 48000, status: 'Active' },

  // EQUITY / CAPITAL
  { code: '301000', name: 'Owner\'s Capital Account', type: 'Equity', category: 'CAPITAL', parent: 'Equity', balance: 900000, status: 'Active' },

  // INCOME
  { code: '401000', name: 'Sales Income', type: 'Income', category: 'INCOME', parent: 'Operating Income', balance: 1245000, status: 'Active' },
  { code: '402000', name: 'Services Income', type: 'Income', category: 'INCOME', parent: 'Operating Income', balance: 85000, status: 'Active' },

  // EXPENSES
  { code: '501000', name: 'Purchase Expense (COGS)', type: 'Expense', category: 'EXPENSES', parent: 'Operating Expenses', balance: 782000, status: 'Active' },
  { code: '502000', name: 'Other Expenses / Logistics', type: 'Expense', category: 'EXPENSES', parent: 'Operating Expenses', balance: 85000, status: 'Active' },
  { code: '503000', name: 'Rent & Electricity', type: 'Expense', category: 'EXPENSES', parent: 'Operating Expenses', balance: 115000, status: 'Active' },
];

export const initialJournals = [
  { id: 'JRNL-01', name: 'Sales Journal', code: 'SJ', type: 'Sales', defaultAccount: '103000 - Debtors', status: 'Active', lastEntry: '2026-09-05' },
  { id: 'JRNL-02', name: 'Purchase Journal', code: 'PJ', type: 'Purchase', defaultAccount: '201000 - Creditors', status: 'Active', lastEntry: '2026-09-04' },
  { id: 'JRNL-03', name: 'Bank Journal', code: 'BNK', type: 'Bank', defaultAccount: '102000 - Bank - HDFC', status: 'Active', lastEntry: '2026-09-05' },
  { id: 'JRNL-04', name: 'Cash Journal', code: 'CSH', type: 'Cash', defaultAccount: '101000 - Cash', status: 'Active', lastEntry: '2026-09-03' },
];

export const initialTaxes = [
  { id: 'TAX-01', name: 'GST 5%', rate: 5, type: 'Sales & Purchase', account: '202000 - GST Payable', status: 'Active' },
  { id: 'TAX-02', name: 'GST 12%', rate: 12, type: 'Sales & Purchase', account: '202000 - GST Payable', status: 'Active' },
  { id: 'TAX-03', name: 'GST 18%', rate: 18, type: 'Sales & Purchase', account: '202000 - GST Payable', status: 'Active' },
];

export const initialAnalyticAccounts = [
  { id: 'ANA-01', code: 'AA-FURN-OPS', name: 'Furniture Operations', responsible: 'Admin', company: 'Urban Furniture', status: 'Active' },
  { id: 'ANA-02', code: 'AA-RETAIL-DIV', name: 'Retail Division', responsible: 'Nimesh Pathak', company: 'Urban Furniture', status: 'Active' },
  { id: 'ANA-03', code: 'AA-OFF-FURN', name: 'Office Furniture', responsible: 'Admin', company: 'Urban Furniture', status: 'Active' },
  { id: 'ANA-04', code: 'AA-SHOWROOM', name: 'Showroom Operations', responsible: 'Rajesh Shah', company: 'Urban Furniture', status: 'Active' },
];

export const initialSalesOrders = [
  {
    id: 'SO-00124',
    customer: 'Nimesh Pathak',
    customerId: 'CUST-001',
    date: '2026-09-05',
    status: 'Invoiced',
    paymentStatus: 'Paid',
    items: [
      { productId: 'PROD-001', productName: 'Office Chair', qty: 5, unitPrice: 5000, taxRate: 18, subtotal: 25000 }
    ],
    subtotal: 25000,
    tax: 4500,
    total: 29500,
    invoiceId: 'INV-00124'
  },
  {
    id: 'SO-00125',
    customer: 'Rajesh Shah',
    customerId: 'CUST-002',
    date: '2026-09-04',
    status: 'Confirmed',
    paymentStatus: 'Paid',
    items: [
      { productId: 'PROD-004', productName: 'Executive Desk', qty: 2, unitPrice: 35000, taxRate: 18, subtotal: 70000 },
      { productId: 'PROD-002', productName: 'Executive Chair', qty: 2, unitPrice: 12500, taxRate: 18, subtotal: 25000 }
    ],
    subtotal: 95000,
    tax: 17100,
    total: 112100,
    invoiceId: 'INV-00125'
  },
  {
    id: 'SO-00126',
    customer: 'Aarav Enterprises',
    customerId: 'CUST-003',
    date: '2026-09-02',
    status: 'Quotation',
    paymentStatus: 'Unpaid',
    items: [
      { productId: 'PROD-005', productName: 'Conference Table', qty: 1, unitPrice: 55000, taxRate: 18, subtotal: 55000 }
    ],
    subtotal: 55000,
    tax: 9900,
    total: 64900,
    invoiceId: null
  }
];

export const initialCustomerInvoices = [
  {
    id: 'INV-00124',
    soId: 'SO-00124',
    customer: 'Nimesh Pathak',
    customerId: 'CUST-001',
    date: '2026-09-05',
    dueDate: '2026-09-20',
    amount: 29500,
    paid: 29500,
    remaining: 0,
    status: 'Paid',
    journalEntryId: 'JE-00045',
    items: [
      { productName: 'Office Chair', qty: 5, unitPrice: 5000, taxRate: 18, total: 29500 }
    ],
    payments: [
      { date: '2026-09-05', ref: 'PAY-C-001', method: 'Bank HDFC', amount: 29500 }
    ]
  },
  {
    id: 'INV-00125',
    soId: 'SO-00125',
    customer: 'Rajesh Shah',
    customerId: 'CUST-002',
    date: '2026-09-04',
    dueDate: '2026-09-19',
    amount: 112100,
    paid: 112100,
    remaining: 0,
    status: 'Paid',
    journalEntryId: 'JE-00046',
    items: [
      { productName: 'Executive Desk', qty: 2, unitPrice: 35000, taxRate: 18, total: 82600 },
      { productName: 'Executive Chair', qty: 2, unitPrice: 12500, taxRate: 18, total: 29500 }
    ],
    payments: [
      { date: '2026-09-04', ref: 'PAY-C-002', method: 'Bank HDFC', amount: 112100 }
    ]
  },
  {
    id: 'INV-00126',
    soId: 'SO-00123',
    customer: 'Aarav Enterprises',
    customerId: 'CUST-003',
    date: '2026-08-28',
    dueDate: '2026-09-04',
    amount: 150000,
    paid: 0,
    remaining: 150000,
    status: 'Overdue',
    journalEntryId: 'JE-00044',
    items: [
      { productName: 'Storage Cabinet', qty: 10, unitPrice: 14000, taxRate: 18, total: 150000 }
    ],
    payments: []
  }
];

export const initialPurchaseOrders = [
  {
    id: 'PO-00231',
    vendor: 'Azure Furniture',
    vendorId: 'VEND-001',
    date: '2026-09-03',
    status: 'Billed',
    billStatus: 'Billed',
    items: [
      { productId: 'PROD-001', productName: 'Office Chair Frame', qty: 20, unitPrice: 3200, taxRate: 18, subtotal: 64000 }
    ],
    subtotal: 64000,
    tax: 11520,
    total: 75520,
    billId: 'BILL-00231'
  },
  {
    id: 'PO-00232',
    vendor: 'WoodCraft Industries',
    vendorId: 'VEND-002',
    date: '2026-09-01',
    status: 'Confirmed',
    billStatus: 'Partially Billed',
    items: [
      { productId: 'PROD-003', productName: 'Wooden Table Board', qty: 10, unitPrice: 11500, taxRate: 12, subtotal: 115000 }
    ],
    subtotal: 115000,
    tax: 13800,
    total: 128800,
    billId: 'BILL-00232'
  }
];

export const initialVendorBills = [
  {
    id: 'BILL-00231',
    poId: 'PO-00231',
    vendor: 'Azure Furniture',
    vendorId: 'VEND-001',
    date: '2026-09-03',
    dueDate: '2026-09-18',
    amount: 75520,
    paid: 75520,
    remaining: 0,
    status: 'Paid',
    journalEntryId: 'JE-00047',
    items: [
      { productName: 'Office Chair Frame', qty: 20, unitPrice: 3200, taxRate: 18, total: 75520 }
    ],
    payments: [
      { date: '2026-09-03', ref: 'PAY-V-001', method: 'Bank HDFC', amount: 75520 }
    ]
  },
  {
    id: 'BILL-00232',
    poId: 'PO-00232',
    vendor: 'WoodCraft Industries',
    vendorId: 'VEND-002',
    date: '2026-09-01',
    dueDate: '2026-09-15',
    amount: 128800,
    paid: 48800,
    remaining: 80000,
    status: 'Partially Paid',
    journalEntryId: 'JE-00048',
    items: [
      { productName: 'Wooden Table Board', qty: 10, unitPrice: 11500, taxRate: 12, total: 128800 }
    ],
    payments: [
      { date: '2026-09-02', ref: 'PAY-V-002', method: 'Bank HDFC', amount: 48800 }
    ]
  }
];

export const initialJournalEntries = [
  {
    id: 'JE-00045',
    date: '2026-09-05',
    journal: 'Sales Journal',
    reference: 'INV-00124',
    totalDebit: 29500,
    totalCredit: 29500,
    status: 'Posted',
    items: [
      { accountCode: '103000', accountName: 'Debtors (Nimesh Pathak)', debit: 29500, credit: 0 },
      { accountCode: '401000', accountName: 'Sales Income Account', debit: 0, credit: 25000 },
      { accountCode: '202000', accountName: 'GST Payable (18%)', debit: 0, credit: 4500 }
    ]
  },
  {
    id: 'JE-00046',
    date: '2026-09-04',
    journal: 'Sales Journal',
    reference: 'INV-00125',
    totalDebit: 112100,
    totalCredit: 112100,
    status: 'Posted',
    items: [
      { accountCode: '103000', accountName: 'Debtors (Rajesh Shah)', debit: 112100, credit: 0 },
      { accountCode: '401000', accountName: 'Sales Income Account', debit: 0, credit: 95000 },
      { accountCode: '202000', accountName: 'GST Payable (18%)', debit: 0, credit: 17100 }
    ]
  },
  {
    id: 'JE-00047',
    date: '2026-09-03',
    journal: 'Purchase Journal',
    reference: 'BILL-00231',
    totalDebit: 75520,
    totalCredit: 75520,
    status: 'Posted',
    items: [
      { accountCode: '501000', accountName: 'Purchase Expense Account', debit: 64000, credit: 0 },
      { accountCode: '202000', accountName: 'GST Input Credit (18%)', debit: 11520, credit: 0 },
      { accountCode: '201000', accountName: 'Creditors (Azure Furniture)', debit: 0, credit: 75520 }
    ]
  },
  {
    id: 'JE-00048',
    date: '2026-09-01',
    journal: 'Purchase Journal',
    reference: 'BILL-00232',
    totalDebit: 128800,
    totalCredit: 128800,
    status: 'Posted',
    items: [
      { accountCode: '501000', accountName: 'Purchase Expense Account', debit: 115000, credit: 0 },
      { accountCode: '202000', accountName: 'GST Input Credit (12%)', debit: 13800, credit: 0 },
      { accountCode: '201000', accountName: 'Creditors (WoodCraft Industries)', debit: 0, credit: 128800 }
    ]
  }
];

export const initialBudgets = [
  {
    id: 'BDG-001',
    name: 'Furniture Purchase Budget',
    period: 'September 2026',
    responsible: 'Admin',
    analyticAccount: 'Furniture Operations',
    plannedAmount: 500000,
    actualAmount: 320000,
    remainingAmount: 180000,
    utilization: 64,
    status: 'In Progress'
  },
  {
    id: 'BDG-002',
    name: 'Showroom Marketing & Setup',
    period: 'Q3 2026',
    responsible: 'Rajesh Shah',
    analyticAccount: 'Showroom Operations',
    plannedAmount: 250000,
    actualAmount: 195000,
    remainingAmount: 55000,
    utilization: 78,
    status: 'In Progress'
  },
  {
    id: 'BDG-003',
    name: 'Retail Division Operations',
    period: 'Fiscal Year 2026-27',
    responsible: 'Nimesh Pathak',
    analyticAccount: 'Retail Division',
    plannedAmount: 1200000,
    actualAmount: 480000,
    remainingAmount: 720000,
    utilization: 40,
    status: 'In Progress'
  }
];

export const initialUsers = [
  { id: 'USR-001', name: 'Admin User', email: 'admin@urbanfurniture.in', role: 'Admin', status: 'Active', lastLogin: '2026-09-05 11:40' },
  { id: 'USR-002', name: 'Senior Accountant', email: 'accountant@urbanfurniture.in', role: 'Accountant', status: 'Active', lastLogin: '2026-09-05 10:15' },
  { id: 'USR-003', name: 'Nimesh Pathak', email: 'nimesh.pathak@example.com', role: 'Contact', status: 'Active', lastLogin: '2026-09-04 16:20' },
];

export const initialRoles = [
  {
    name: 'Admin',
    description: 'Full access to master data, transactions, accounting entries, reports, and settings.',
    permissions: {
      masterData: ['Read', 'Write', 'Delete'],
      transactions: ['Read', 'Write', 'Approve'],
      accounting: ['Read', 'Write', 'Post'],
      reports: ['Read', 'Export'],
      settings: ['Read', 'Write']
    }
  },
  {
    name: 'Accountant',
    description: 'Access to record transactions, issue invoices, register payments, and view financial statements.',
    permissions: {
      masterData: ['Read', 'Write'],
      transactions: ['Read', 'Write'],
      accounting: ['Read', 'Write', 'Post'],
      reports: ['Read', 'Export'],
      settings: ['Read']
    }
  },
  {
    name: 'Contact',
    description: 'Restricted portal access to view personal invoices, order timeline, and make payments.',
    permissions: {
      masterData: ['Read Self'],
      transactions: ['Read Self', 'Pay'],
      accounting: ['None'],
      reports: ['None'],
      settings: ['None']
    }
  }
];

export const initialNotifications = [
  { id: 'NOTIF-01', title: 'Invoice Overdue', message: 'Invoice INV-00126 (Aarav Enterprises) is overdue by 1 day', time: '10 mins ago', read: false, type: 'warning', link: '/sales/invoices/INV-00126' },
  { id: 'NOTIF-02', title: 'Goods Received', message: 'Purchase Order PO-00231 received from Azure Furniture', time: '1 hour ago', read: false, type: 'info', link: '/purchase/orders/PO-00231' },
  { id: 'NOTIF-03', title: 'Payment Received', message: 'Payment of ₹29,500 received from Nimesh Pathak', time: '2 hours ago', read: false, type: 'success', link: '/sales/payments' },
  { id: 'NOTIF-04', title: 'Bill Due Soon', message: 'Vendor Bill BILL-00232 is due in 10 days', time: '1 day ago', read: true, type: 'warning', link: '/purchase/bills/BILL-00232' },
  { id: 'NOTIF-05', title: 'Monthly P&L Ready', message: 'P&L report generated for August 2026', time: '2 days ago', read: true, type: 'info', link: '/reports/profit-loss' },
];
