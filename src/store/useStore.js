import { create } from 'zustand';
import {
  authService,
  contactsService,
  productsService,
  salesService,
  purchaseService,
  accountingService,
  budgetService,
  dashboardService,
  reportsService
} from '../services';

const initialUser = (() => {
  try {
    const saved = localStorage.getItem('uf_user_session');
    return saved ? JSON.parse(saved) : {
      name: 'Admin User',
      email: 'admin@urbanfurniture.in',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    };
  } catch {
    return {
      name: 'Admin User',
      email: 'admin@urbanfurniture.in',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    };
  }
})();

export const useStore = create((set, get) => ({
  // Authentication & Role Session State
  user: initialUser,
  loading: false,
  error: null,

  activeAccounts: {
    'Administrator': {
      name: 'Admin User',
      email: 'admin@urbanfurniture.in',
      role: 'ADMIN',
      roleKey: 'Administrator',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    },
    'Accountant': {
      name: 'Accountant User',
      email: 'accountant@urbanfurniture.in',
      role: 'ACCOUNTANT',
      roleKey: 'Accountant',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    'Sales & Purchase User': {
      name: 'Sales & Purchase User',
      email: 'sales@urbanfurniture.in',
      role: 'SALES_PURCHASE',
      roleKey: 'Sales & Purchase User',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    }
  },

  setUser: (user) => {
    try {
      localStorage.setItem('uf_user_session', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
    set({ user });
  },

  switchRoleAccount: async (roleKeyOrEmail) => {
    let email = 'admin@urbanfurniture.in';
    let roleName = 'Administrator';
    let roleEnum = 'ADMIN';
    let avatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80';

    if (roleKeyOrEmail === 'Accountant' || roleKeyOrEmail === 'accountant@urbanfurniture.in') {
      email = 'accountant@urbanfurniture.in';
      roleName = 'Accountant';
      roleEnum = 'ACCOUNTANT';
      avatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80';
    } else if (roleKeyOrEmail === 'Sales & Purchase User' || roleKeyOrEmail === 'sales@urbanfurniture.in' || roleKeyOrEmail === 'Sales') {
      email = 'sales@urbanfurniture.in';
      roleName = 'Sales & Purchase User';
      roleEnum = 'SALES_PURCHASE';
      avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
    }

    try {
      const res = await authService.login(email, 'Password@123');
      const newUser = {
        id: res.user?.id,
        name: res.user?.name || roleName,
        email: res.user?.email || email,
        role: roleName,
        roleEnum: res.user?.role || roleEnum,
        avatar
      };
      get().setUser(newUser);
      return newUser;
    } catch (err) {
      console.warn('Backend login fallback during role switch:', err);
      const fallbackUser = {
        name: roleName,
        email,
        role: roleName,
        roleEnum,
        avatar
      };
      get().setUser(fallbackUser);
      return fallbackUser;
    }
  },

  // Dynamic ERP Business Data (PostgreSQL-backed, no localStorage persistence)
  contacts: [],
  products: [],
  chartOfAccounts: [],
  journals: [],
  taxes: [],
  analyticAccounts: [],
  salesOrders: [],
  customerInvoices: [],
  purchaseOrders: [],
  vendorBills: [],
  journalEntries: [],
  budgets: [],
  dashboardSummary: null,

  // Notifications State & Handlers
  notifications: [
    {
      id: 'notif-1',
      title: 'Customer Payment Received',
      message: '₹29,500 received from Nimesh Pathak (INV-00124)',
      time: '10m ago',
      type: 'success',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Sales Order Confirmed',
      message: 'SO-00125 confirmed for Rajesh Shah (₹1,12,100)',
      time: '1h ago',
      type: 'info',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Vendor Bill Posted',
      message: 'BILL-00231 posted from Azure Furniture (₹75,520)',
      time: '3h ago',
      type: 'warning',
      read: true,
    }
  ],

  markNotificationRead: (id) => set((state) => ({
    notifications: (state.notifications || []).map(n => n.id === id ? { ...n, read: true } : n)
  })),

  clearAllNotifications: () => set(() => ({
    notifications: []
  })),

  // Async API Fetchers & Mutators
  fetchContacts: async () => {
    try {
      const data = await contactsService.getAll();
      const items = Array.isArray(data) ? data : data?.items || [];
      set({ contacts: items });
      return items;
    } catch (e) {
      console.error('Failed to fetch contacts from API:', e);
      return [];
    }
  },
  addContact: async (contact) => {
    const created = await contactsService.create(contact);
    await get().fetchContacts();
    return created;
  },
  updateContact: async (id, data) => {
    const updated = await contactsService.update(id, data);
    await get().fetchContacts();
    return updated;
  },
  deleteContact: async (id) => {
    await contactsService.delete(id);
    await get().fetchContacts();
  },

  fetchProducts: async () => {
    try {
      const data = await productsService.getAll();
      const items = Array.isArray(data) ? data : data?.items || [];
      set({ products: items });
      return items;
    } catch (e) {
      console.error('Failed to fetch products from API:', e);
      return [];
    }
  },
  addProduct: async (product) => {
    const created = await productsService.create(product);
    await get().fetchProducts();
    return created;
  },
  updateProduct: async (id, data) => {
    const updated = await productsService.update(id, data);
    await get().fetchProducts();
    return updated;
  },

  fetchChartOfAccounts: async () => {
    try {
      const data = await accountingService.getChartOfAccounts();
      const items = Array.isArray(data) ? data : data?.items || [];
      set({ chartOfAccounts: items });
      return items;
    } catch (e) {
      console.error('Failed to fetch chart of accounts:', e);
      return [];
    }
  },
  addAccount: async (acc) => {
    const created = await accountingService.createAccount(acc);
    await get().fetchChartOfAccounts();
    return created;
  },

  fetchJournals: async () => {
    try {
      const data = await accountingService.getJournals();
      const items = Array.isArray(data) ? data : [];
      set({ journals: items });
      return items;
    } catch (e) {
      console.error('Failed to fetch journals:', e);
      return [];
    }
  },
  addJournal: async (j) => {
    const created = await accountingService.createJournal(j);
    await get().fetchJournals();
    return created;
  },

  fetchTaxes: async () => {
    try {
      const data = await accountingService.getTaxes();
      const items = Array.isArray(data) ? data : data?.items || [];
      set({ taxes: items });
      return items;
    } catch (e) {
      console.error('Failed to fetch taxes:', e);
      return [];
    }
  },

  fetchAnalyticAccounts: async () => {
    try {
      const data = await accountingService.getAnalyticAccounts();
      const items = Array.isArray(data) ? data : data?.items || [];
      set({ analyticAccounts: items });
      return items;
    } catch (e) {
      console.error('Failed to fetch analytic accounts:', e);
      return [];
    }
  },

  fetchSalesOrders: async () => {
    try {
      const data = await salesService.getOrders();
      const items = Array.isArray(data) ? data : data?.items || [];
      set({ salesOrders: items });
      return items;
    } catch (e) {
      console.error('Failed to fetch sales orders:', e);
      return [];
    }
  },
  addSalesOrder: async (so) => {
    const created = await salesService.createOrder(so);
    await get().fetchSalesOrders();
    return created;
  },
  createInvoiceFromSO: async (soId) => {
    const res = await salesService.createInvoiceFromOrder(soId);
    await get().fetchSalesOrders();
    await get().fetchCustomerInvoices();
    await get().fetchJournalEntries();
    return res;
  },

  fetchCustomerInvoices: async () => {
    try {
      const data = await salesService.getInvoices();
      const items = Array.isArray(data) ? data : data?.items || [];
      set({ customerInvoices: items });
      return items;
    } catch (e) {
      console.error('Failed to fetch invoices:', e);
      return [];
    }
  },
  registerCustomerPayment: async (invoiceId, amount, method, ref) => {
    const res = await salesService.registerPayment({ invoiceId, amount: Number(amount), method: method.includes('Cash') ? 'CASH' : 'BANK', reference: ref });
    await get().fetchCustomerInvoices();
    await get().fetchSalesOrders();
    await get().fetchJournalEntries();
    return res;
  },

  fetchPurchaseOrders: async () => {
    try {
      const data = await purchaseService.getOrders();
      const items = Array.isArray(data) ? data : data?.items || [];
      set({ purchaseOrders: items });
      return items;
    } catch (e) {
      console.error('Failed to fetch purchase orders:', e);
      return [];
    }
  },
  addPurchaseOrder: async (po) => {
    const created = await purchaseService.createOrder(po);
    await get().fetchPurchaseOrders();
    return created;
  },
  createVendorBillFromPO: async (poId) => {
    const res = await purchaseService.createBillFromOrder(poId);
    await get().fetchPurchaseOrders();
    await get().fetchVendorBills();
    await get().fetchJournalEntries();
    return res;
  },

  fetchVendorBills: async () => {
    try {
      const data = await purchaseService.getBills();
      const items = Array.isArray(data) ? data : data?.items || [];
      set({ vendorBills: items });
      return items;
    } catch (e) {
      console.error('Failed to fetch vendor bills:', e);
      return [];
    }
  },
  registerVendorPayment: async (billId, amount, method, ref) => {
    const res = await purchaseService.registerPayment({ billId, amount: Number(amount), method: method.includes('Cash') ? 'CASH' : 'BANK', reference: ref });
    await get().fetchVendorBills();
    await get().fetchPurchaseOrders();
    await get().fetchJournalEntries();
    return res;
  },

  fetchJournalEntries: async () => {
    try {
      const data = await accountingService.getJournalEntries();
      const items = Array.isArray(data) ? data : data?.items || [];
      set({ journalEntries: items });
      return items;
    } catch (e) {
      console.error('Failed to fetch journal entries:', e);
      return [];
    }
  },
  addJournalEntry: async (entry) => {
    const created = await accountingService.createJournalEntry(entry);
    await get().fetchJournalEntries();
    return created;
  },

  fetchBudgets: async () => {
    try {
      const data = await budgetService.getBudgets();
      const items = Array.isArray(data) ? data : data?.items || [];
      set({ budgets: items });
      return items;
    } catch (e) {
      console.error('Failed to fetch budgets:', e);
      return [];
    }
  },
  addBudget: async (b) => {
    const created = await budgetService.createBudget(b);
    await get().fetchBudgets();
    return created;
  },

  fetchDashboardSummary: async () => {
    try {
      const data = await dashboardService.getSummary();
      set({ dashboardSummary: data });
      return data;
    } catch (e) {
      console.error('Failed to fetch dashboard summary:', e);
      return null;
    }
  }
}));
