import { useStore } from '../store/useStore';

export const contactsService = {
  getAll: () => useStore.getState().contacts,
  getById: (id) => useStore.getState().contacts.find(c => c.id === id),
  create: (data) => useStore.getState().addContact(data),
  update: (id, data) => useStore.getState().updateContact(id, data),
  delete: (id) => useStore.getState().deleteContact(id),
};

export const productsService = {
  getAll: () => useStore.getState().products,
  getById: (id) => useStore.getState().products.find(p => p.id === id),
  create: (data) => useStore.getState().addProduct(data),
  update: (id, data) => useStore.getState().updateProduct(id, data),
};

export const salesService = {
  getOrders: () => useStore.getState().salesOrders,
  getOrderById: (id) => useStore.getState().salesOrders.find(s => s.id === id),
  createOrder: (data) => useStore.getState().addSalesOrder(data),
  createInvoiceFromOrder: (id) => useStore.getState().createInvoiceFromSO(id),
  getInvoices: () => useStore.getState().customerInvoices,
  getInvoiceById: (id) => useStore.getState().customerInvoices.find(i => i.id === id),
  registerPayment: (invId, amount, method, ref) => useStore.getState().registerCustomerPayment(invId, amount, method, ref),
};

export const purchaseService = {
  getOrders: () => useStore.getState().purchaseOrders,
  getOrderById: (id) => useStore.getState().purchaseOrders.find(p => p.id === id),
  createOrder: (data) => useStore.getState().addPurchaseOrder(data),
  createBillFromOrder: (id) => useStore.getState().createVendorBillFromPO(id),
  getBills: () => useStore.getState().vendorBills,
  getBillById: (id) => useStore.getState().vendorBills.find(b => b.id === id),
  registerPayment: (billId, amount, method, ref) => useStore.getState().registerVendorPayment(billId, amount, method, ref),
};

export const accountingService = {
  getChartOfAccounts: () => useStore.getState().chartOfAccounts,
  getJournals: () => useStore.getState().journals,
  getJournalEntries: () => useStore.getState().journalEntries,
  getJournalEntryById: (id) => useStore.getState().journalEntries.find(j => j.id === id),
  createJournalEntry: (data) => useStore.getState().addJournalEntry(data),
  getTaxes: () => useStore.getState().taxes,
  getAnalyticAccounts: () => useStore.getState().analyticAccounts,
};

export const budgetService = {
  getBudgets: () => useStore.getState().budgets,
  getBudgetById: (id) => useStore.getState().budgets.find(b => b.id === id),
  createBudget: (data) => useStore.getState().addBudget(data),
};
