import { Router, Request, Response } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import contactRoutes from '../modules/contacts/contacts.routes.js';
import productRoutes from '../modules/products/products.routes.js';
import accountRoutes from '../modules/accounts/accounts.routes.js';
import journalRoutes from '../modules/journals/journals.routes.js';
import taxRoutes from '../modules/taxes/taxes.routes.js';
import analyticRoutes from '../modules/analyticAccounts/analyticAccounts.routes.js';
import budgetRoutes from '../modules/budgets/budgets.routes.js';
import salesRoutes from '../modules/sales/sales.routes.js';
import invoiceRoutes from '../modules/invoices/invoices.routes.js';
import purchaseRoutes from '../modules/purchases/purchases.routes.js';
import vendorBillRoutes from '../modules/vendorBills/vendorBills.routes.js';
import paymentRoutes from '../modules/payments/payments.routes.js';
import journalEntryRoutes from '../modules/journalEntries/journalEntries.routes.js';
import ledgerRoutes from '../modules/ledger/ledger.routes.js';
import reportRoutes from '../modules/reports/reports.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';
import portalRoutes from '../modules/portal/portal.routes.js';
import searchRoutes from '../modules/search/search.routes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Urban Furniture Accounting ERP REST API is healthy and operational.',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/contacts', contactRoutes);
router.use('/products', productRoutes);
router.use('/accounts', accountRoutes);
router.use('/journals', journalRoutes);
router.use('/taxes', taxRoutes);
router.use('/analytic-accounts', analyticRoutes);
router.use('/budgets', budgetRoutes);
router.use('/sales-orders', salesRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/purchase-orders', purchaseRoutes);
router.use('/vendor-bills', vendorBillRoutes);
router.use('/payments', paymentRoutes);
router.use('/journal-entries', journalEntryRoutes);
router.use('/ledger', ledgerRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/portal', portalRoutes);
router.use('/search', searchRoutes);

export default router;
