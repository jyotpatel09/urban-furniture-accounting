import { create } from 'zustand';
import {
  initialContacts,
  initialProducts,
  initialChartOfAccounts,
  initialJournals,
  initialTaxes,
  initialAnalyticAccounts,
  initialSalesOrders,
  initialCustomerInvoices,
  initialPurchaseOrders,
  initialVendorBills,
  initialJournalEntries,
  initialBudgets,
  initialUsers,
  initialRoles,
  initialNotifications
} from '../data/mockData';

const loadLocal = (key, fallback) => {
  try {
    const saved = localStorage.getItem(`uf_acc_${key}`);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const saveLocal = (key, val) => {
  try {
    localStorage.setItem(`uf_acc_${key}`, JSON.stringify(val));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

export const useStore = create((set, get) => ({
  // Authentication state
  user: loadLocal('user', {
    name: 'Admin User',
    email: 'admin@urbanfurniture.in',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  }),
  setUser: (user) => {
    saveLocal('user', user);
    set({ user });
  },

  // Master Data
  contacts: loadLocal('contacts', initialContacts),
  addContact: (contact) => set((state) => {
    const newContact = {
      ...contact,
      id: contact.type === 'Vendor' ? `VEND-00${state.contacts.length + 1}` : `CUST-00${state.contacts.length + 1}`,
      status: 'Active',
      totalSales: 0,
      paidSales: 0,
      unpaidSales: 0,
      outstanding: 0,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };
    const updated = [newContact, ...state.contacts];
    saveLocal('contacts', updated);
    return { contacts: updated };
  }),
  updateContact: (id, contactData) => set((state) => {
    const updated = state.contacts.map((c) => c.id === id ? { ...c, ...contactData } : c);
    saveLocal('contacts', updated);
    return { contacts: updated };
  }),
  deleteContact: (id) => set((state) => {
    const updated = state.contacts.filter((c) => c.id !== id);
    saveLocal('contacts', updated);
    return { contacts: updated };
  }),

  products: loadLocal('products', initialProducts),
  addProduct: (prod) => set((state) => {
    const newProd = {
      ...prod,
      id: `PROD-00${state.products.length + 1}`,
      status: 'Active',
      salesCount: 0,
      purchaseCount: 0,
    };
    const updated = [newProd, ...state.products];
    saveLocal('products', updated);
    return { products: updated };
  }),
  updateProduct: (id, prodData) => set((state) => {
    const updated = state.products.map((p) => p.id === id ? { ...p, ...prodData } : p);
    saveLocal('products', updated);
    return { products: updated };
  }),

  chartOfAccounts: loadLocal('chartOfAccounts', initialChartOfAccounts),
  journals: loadLocal('journals', initialJournals),
  taxes: loadLocal('taxes', initialTaxes),
  analyticAccounts: loadLocal('analyticAccounts', initialAnalyticAccounts),

  // Sales Module
  salesOrders: loadLocal('salesOrders', initialSalesOrders),
  addSalesOrder: (so) => set((state) => {
    const newSO = {
      ...so,
      id: `SO-00${124 + state.salesOrders.length}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Confirmed',
      paymentStatus: 'Unpaid',
      invoiceId: null
    };
    const updated = [newSO, ...state.salesOrders];
    saveLocal('salesOrders', updated);
    return { salesOrders: updated };
  }),
  
  createInvoiceFromSO: (soId) => set((state) => {
    const so = state.salesOrders.find((s) => s.id === soId);
    if (!so) return state;

    const invId = `INV-00${124 + state.customerInvoices.length}`;
    const newInvoice = {
      id: invId,
      soId: so.id,
      customer: so.customer,
      customerId: so.customerId,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: so.total,
      paid: 0,
      remaining: so.total,
      status: 'Posted',
      journalEntryId: `JE-00${45 + state.journalEntries.length}`,
      items: so.items.map(item => ({
        productName: item.productName,
        qty: item.qty,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        total: item.subtotal * (1 + item.taxRate / 100)
      })),
      payments: []
    };

    // Update SO status
    const updatedSOs = state.salesOrders.map(s => s.id === soId ? { ...s, status: 'Invoiced', invoiceId: invId } : s);
    const updatedInvoices = [newInvoice, ...state.customerInvoices];

    // Create automatically balanced Journal Entry
    const newJE = {
      id: newInvoice.journalEntryId,
      date: newInvoice.date,
      journal: 'Sales Journal',
      reference: invId,
      totalDebit: so.total,
      totalCredit: so.total,
      status: 'Posted',
      items: [
        { accountCode: '103000', accountName: `Debtors (${so.customer})`, debit: so.total, credit: 0 },
        { accountCode: '401000', accountName: 'Sales Income Account', debit: 0, credit: so.subtotal },
        { accountCode: '202000', accountName: `GST Payable (${so.tax > 0 ? '18%' : '0%'})`, debit: 0, credit: so.tax }
      ]
    };
    const updatedJEs = [newJE, ...state.journalEntries];

    saveLocal('salesOrders', updatedSOs);
    saveLocal('customerInvoices', updatedInvoices);
    saveLocal('journalEntries', updatedJEs);

    return {
      salesOrders: updatedSOs,
      customerInvoices: updatedInvoices,
      journalEntries: updatedJEs
    };
  }),

  customerInvoices: loadLocal('customerInvoices', initialCustomerInvoices),
  registerCustomerPayment: (invoiceId, amount, method, ref) => set((state) => {
    const inv = state.customerInvoices.find(i => i.id === invoiceId);
    if (!inv) return state;

    const paymentAmount = Number(amount);
    const newPaid = inv.paid + paymentAmount;
    const newRemaining = Math.max(0, inv.amount - newPaid);
    const newStatus = newRemaining === 0 ? 'Paid' : 'Partially Paid';

    const paymentRec = {
      date: new Date().toISOString().split('T')[0],
      ref: ref || `PAY-C-00${Date.now().toString().slice(-3)}`,
      method: method || 'Bank HDFC',
      amount: paymentAmount
    };

    const updatedInvoices = state.customerInvoices.map(i => 
      i.id === invoiceId 
        ? { ...i, paid: newPaid, remaining: newRemaining, status: newStatus, payments: [...i.payments, paymentRec] } 
        : i
    );

    // Update Sales order payment status if linked
    const updatedSOs = state.salesOrders.map(s => 
      s.invoiceId === invoiceId 
        ? { ...s, paymentStatus: newStatus }
        : s
    );

    // Create Payment Journal Entry (Cash/Bank Debit, Debtors Credit)
    const newJE = {
      id: `JE-00${45 + state.journalEntries.length}`,
      date: new Date().toISOString().split('T')[0],
      journal: method.includes('Cash') ? 'Cash Journal' : 'Bank Journal',
      reference: paymentRec.ref,
      totalDebit: paymentAmount,
      totalCredit: paymentAmount,
      status: 'Posted',
      items: [
        { accountCode: method.includes('Cash') ? '101000' : '102000', accountName: method.includes('Cash') ? 'Cash Account' : 'Bank - HDFC Account', debit: paymentAmount, credit: 0 },
        { accountCode: '103000', accountName: `Debtors (${inv.customer})`, debit: 0, credit: paymentAmount }
      ]
    };

    const updatedJEs = [newJE, ...state.journalEntries];

    saveLocal('customerInvoices', updatedInvoices);
    saveLocal('salesOrders', updatedSOs);
    saveLocal('journalEntries', updatedJEs);

    return {
      customerInvoices: updatedInvoices,
      salesOrders: updatedSOs,
      journalEntries: updatedJEs
    };
  }),

  // Purchase Module
  purchaseOrders: loadLocal('purchaseOrders', initialPurchaseOrders),
  addPurchaseOrder: (po) => set((state) => {
    const newPO = {
      ...po,
      id: `PO-00${231 + state.purchaseOrders.length}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Confirmed',
      billStatus: 'Not Billed',
      billId: null
    };
    const updated = [newPO, ...state.purchaseOrders];
    saveLocal('purchaseOrders', updated);
    return { purchaseOrders: updated };
  }),

  createVendorBillFromPO: (poId) => set((state) => {
    const po = state.purchaseOrders.find(p => p.id === poId);
    if (!po) return state;

    const billId = `BILL-00${231 + state.vendorBills.length}`;
    const newBill = {
      id: billId,
      poId: po.id,
      vendor: po.vendor,
      vendorId: po.vendorId,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: po.total,
      paid: 0,
      remaining: po.total,
      status: 'Posted',
      journalEntryId: `JE-00${45 + state.journalEntries.length}`,
      items: po.items.map(item => ({
        productName: item.productName,
        qty: item.qty,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        total: item.subtotal * (1 + item.taxRate / 100)
      })),
      payments: []
    };

    const updatedPOs = state.purchaseOrders.map(p => p.id === poId ? { ...p, status: 'Billed', billStatus: 'Billed', billId } : p);
    const updatedBills = [newBill, ...state.vendorBills];

    // Create Purchase Journal Entry
    const newJE = {
      id: newBill.journalEntryId,
      date: newBill.date,
      journal: 'Purchase Journal',
      reference: billId,
      totalDebit: po.total,
      totalCredit: po.total,
      status: 'Posted',
      items: [
        { accountCode: '501000', accountName: 'Purchase Expense Account', debit: po.subtotal, credit: 0 },
        { accountCode: '202000', accountName: `GST Input Credit (${po.tax > 0 ? '18%' : '0%'})`, debit: po.tax, credit: 0 },
        { accountCode: '201000', accountName: `Creditors (${po.vendor})`, debit: 0, credit: po.total }
      ]
    };

    const updatedJEs = [newJE, ...state.journalEntries];

    saveLocal('purchaseOrders', updatedPOs);
    saveLocal('vendorBills', updatedBills);
    saveLocal('journalEntries', updatedJEs);

    return {
      purchaseOrders: updatedPOs,
      vendorBills: updatedBills,
      journalEntries: updatedJEs
    };
  }),

  vendorBills: loadLocal('vendorBills', initialVendorBills),
  registerVendorPayment: (billId, amount, method, ref) => set((state) => {
    const bill = state.vendorBills.find(b => b.id === billId);
    if (!bill) return state;

    const paymentAmount = Number(amount);
    const newPaid = bill.paid + paymentAmount;
    const newRemaining = Math.max(0, bill.amount - newPaid);
    const newStatus = newRemaining === 0 ? 'Paid' : 'Partially Paid';

    const paymentRec = {
      date: new Date().toISOString().split('T')[0],
      ref: ref || `PAY-V-00${Date.now().toString().slice(-3)}`,
      method: method || 'Bank HDFC',
      amount: paymentAmount
    };

    const updatedBills = state.vendorBills.map(b => 
      b.id === billId 
        ? { ...b, paid: newPaid, remaining: newRemaining, status: newStatus, payments: [...b.payments, paymentRec] } 
        : b
    );

    // Create Payment Journal Entry (Creditors Debit, Cash/Bank Credit)
    const newJE = {
      id: `JE-00${45 + state.journalEntries.length}`,
      date: new Date().toISOString().split('T')[0],
      journal: method.includes('Cash') ? 'Cash Journal' : 'Bank Journal',
      reference: paymentRec.ref,
      totalDebit: paymentAmount,
      totalCredit: paymentAmount,
      status: 'Posted',
      items: [
        { accountCode: '201000', accountName: `Creditors (${bill.vendor})`, debit: paymentAmount, credit: 0 },
        { accountCode: method.includes('Cash') ? '101000' : '102000', accountName: method.includes('Cash') ? 'Cash Account' : 'Bank - HDFC Account', debit: 0, credit: paymentAmount }
      ]
    };

    const updatedJEs = [newJE, ...state.journalEntries];

    saveLocal('vendorBills', updatedBills);
    saveLocal('journalEntries', updatedJEs);

    return {
      vendorBills: updatedBills,
      journalEntries: updatedJEs
    };
  }),

  // Accounting Module
  journalEntries: loadLocal('journalEntries', initialJournalEntries),
  addJournalEntry: (entry) => set((state) => {
    const newJE = {
      ...entry,
      id: `JE-00${45 + state.journalEntries.length}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Posted'
    };
    const updated = [newJE, ...state.journalEntries];
    saveLocal('journalEntries', updated);
    return { journalEntries: updated };
  }),

  // Budgeting Module
  budgets: loadLocal('budgets', initialBudgets),
  addBudget: (budget) => set((state) => {
    const newBudget = {
      ...budget,
      id: `BDG-00${state.budgets.length + 1}`,
      actualAmount: 0,
      remainingAmount: budget.plannedAmount,
      utilization: 0,
      status: 'In Progress'
    };
    const updated = [newBudget, ...state.budgets];
    saveLocal('budgets', updated);
    return { budgets: updated };
  }),

  // System Settings / Users / Notifications
  users: loadLocal('users', initialUsers),
  roles: loadLocal('roles', initialRoles),
  notifications: loadLocal('notifications', initialNotifications),

  markNotificationRead: (id) => set((state) => {
    const updated = state.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveLocal('notifications', updated);
    return { notifications: updated };
  }),
  clearAllNotifications: () => set(() => {
    saveLocal('notifications', []);
    return { notifications: [] };
  })
}));
