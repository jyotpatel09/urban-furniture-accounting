import { api, setAuthToken } from './api';

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.token) {
      setAuthToken(res.data.token);
    }
    return res.data;
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAuthToken('');
    }
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const contactsService = {
  getAll: async (params) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await api.get(`/contacts${query}`);
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/contacts/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/contacts', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.patch(`/contacts/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/contacts/${id}`);
    return res.data;
  },
};

export const productsService = {
  getAll: async (params) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await api.get(`/products${query}`);
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/products', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.patch(`/products/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },
};

export const salesService = {
  getOrders: async () => {
    const res = await api.get('/sales-orders');
    return res.data;
  },
  getOrderById: async (id) => {
    const res = await api.get(`/sales-orders/${id}`);
    return res.data;
  },
  createOrder: async (data) => {
    const res = await api.post('/sales-orders', data);
    return res.data;
  },
  confirmOrder: async (id) => {
    const res = await api.post(`/sales-orders/${id}/confirm`);
    return res.data;
  },
  createInvoiceFromOrder: async (id) => {
    const res = await api.post(`/sales-orders/${id}/create-invoice`);
    return res.data;
  },
  getInvoices: async () => {
    const res = await api.get('/invoices');
    return res.data;
  },
  getInvoiceById: async (id) => {
    const res = await api.get(`/invoices/${id}`);
    return res.data;
  },
  createInvoice: async (data) => {
    const res = await api.post('/invoices', data);
    return res.data;
  },
  postInvoice: async (id) => {
    const res = await api.post(`/invoices/${id}/post`);
    return res.data;
  },
  registerPayment: async (data) => {
    const res = await api.post('/payments', { ...data, paymentType: 'CUSTOMER' });
    return res.data;
  },
};

export const purchaseService = {
  getOrders: async () => {
    const res = await api.get('/purchase-orders');
    return res.data;
  },
  getOrderById: async (id) => {
    const res = await api.get(`/purchase-orders/${id}`);
    return res.data;
  },
  createOrder: async (data) => {
    const res = await api.post('/purchase-orders', data);
    return res.data;
  },
  createBillFromOrder: async (id) => {
    const res = await api.post(`/purchase-orders/${id}/create-bill`);
    return res.data;
  },
  getBills: async () => {
    const res = await api.get('/vendor-bills');
    return res.data;
  },
  getBillById: async (id) => {
    const res = await api.get(`/vendor-bills/${id}`);
    return res.data;
  },
  createBill: async (data) => {
    const res = await api.post('/vendor-bills', data);
    return res.data;
  },
  postBill: async (id) => {
    const res = await api.post(`/vendor-bills/${id}/post`);
    return res.data;
  },
  registerPayment: async (data) => {
    const res = await api.post('/payments', { ...data, paymentType: 'VENDOR' });
    return res.data;
  },
};

export const accountingService = {
  getChartOfAccounts: async () => {
    const res = await api.get('/accounts');
    return res.data;
  },
  getAccountById: async (id) => {
    const res = await api.get(`/accounts/${id}`);
    return res.data;
  },
  createAccount: async (data) => {
    const res = await api.post('/accounts', data);
    return res.data;
  },
  getJournals: async () => {
    const res = await api.get('/journals');
    return res.data;
  },
  createJournal: async (data) => {
    const res = await api.post('/journals', data);
    return res.data;
  },
  getJournalEntries: async () => {
    const res = await api.get('/journal-entries');
    return res.data;
  },
  getJournalEntryById: async (id) => {
    const res = await api.get(`/journal-entries/${id}`);
    return res.data;
  },
  createJournalEntry: async (data) => {
    const res = await api.post('/journal-entries', data);
    return res.data;
  },
  postJournalEntry: async (id) => {
    const res = await api.post(`/journal-entries/${id}/post`);
    return res.data;
  },
  getTaxes: async () => {
    const res = await api.get('/taxes');
    return res.data;
  },
  createTax: async (data) => {
    const res = await api.post('/taxes', data);
    return res.data;
  },
  getAnalyticAccounts: async () => {
    const res = await api.get('/analytic-accounts');
    return res.data;
  },
  createAnalyticAccount: async (data) => {
    const res = await api.post('/analytic-accounts', data);
    return res.data;
  },
  getGeneralLedger: async (params) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await api.get(`/ledger${query}`);
    return res.data;
  },
};

export const budgetService = {
  getBudgets: async () => {
    const res = await api.get('/budgets');
    return res.data;
  },
  getBudgetById: async (id) => {
    const res = await api.get(`/budgets/${id}`);
    return res.data;
  },
  createBudget: async (data) => {
    const res = await api.post('/budgets', data);
    return res.data;
  },
};

export const reportsService = {
  getProfitLoss: async (params) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await api.get(`/reports/profit-loss${query}`);
    return res.data;
  },
  getBalanceSheet: async (params) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await api.get(`/reports/balance-sheet${query}`);
    return res.data;
  },
  getBudgetReport: async () => {
    const res = await api.get('/reports/budget');
    return res.data;
  },
};

export const dashboardService = {
  getSummary: async () => {
    const res = await api.get('/dashboard/summary');
    return res.data;
  },
};
