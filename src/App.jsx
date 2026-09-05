import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Main Dashboard
import { DashboardPage } from './pages/dashboard/DashboardPage';

// Master Data
import { ContactsPage } from './pages/master/ContactsPage';
import { ContactDetailPage } from './pages/master/ContactDetailPage';
import { ProductsPage } from './pages/master/ProductsPage';
import { ProductDetailPage } from './pages/master/ProductDetailPage';
import { ChartOfAccountsPage } from './pages/master/ChartOfAccountsPage';
import { JournalsPage } from './pages/master/JournalsPage';

// Sales Module
import { SalesOrdersPage } from './pages/sales/SalesOrdersPage';
import { SalesOrderDetailPage } from './pages/sales/SalesOrderDetailPage';
import { InvoicesPage } from './pages/sales/InvoicesPage';
import { InvoiceDetailPage } from './pages/sales/InvoiceDetailPage';
import { PaymentsPage } from './pages/sales/PaymentsPage';

// Purchase Module
import { PurchaseOrdersPage } from './pages/purchase/PurchaseOrdersPage';
import { PurchaseOrderDetailPage } from './pages/purchase/PurchaseOrderDetailPage';
import { VendorBillsPage } from './pages/purchase/VendorBillsPage';
import { VendorBillDetailPage } from './pages/purchase/VendorBillDetailPage';
import { PurchasePaymentsPage } from './pages/purchase/PurchasePaymentsPage';

// Accounting Module
import { JournalEntriesPage } from './pages/accounting/JournalEntriesPage';
import { JournalEntryDetailPage } from './pages/accounting/JournalEntryDetailPage';
import { GeneralLedgerPage } from './pages/accounting/GeneralLedgerPage';
import { TaxesPage } from './pages/accounting/TaxesPage';
import { AnalyticAccountsPage } from './pages/accounting/AnalyticAccountsPage';

// Budgeting Module
import { BudgetsPage } from './pages/budgets/BudgetsPage';
import { BudgetDetailPage } from './pages/budgets/BudgetDetailPage';

// Reports Module
import { BalanceSheetPage } from './pages/reports/BalanceSheetPage';
import { ProfitLossPage } from './pages/reports/ProfitLossPage';
import { BudgetReportPage } from './pages/reports/BudgetReportPage';

// Settings Module
import { SettingsPage } from './pages/settings/SettingsPage';

export default function App() {
  return (
    <Routes>
      {/* Auth Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Main Application Layout Routes */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Master Data */}
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/contacts/:id" element={<ContactDetailPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/accounts" element={<ChartOfAccountsPage />} />
        <Route path="/journals" element={<JournalsPage />} />

        {/* Sales */}
        <Route path="/sales/orders" element={<SalesOrdersPage />} />
        <Route path="/sales/orders/:id" element={<SalesOrderDetailPage />} />
        <Route path="/sales/invoices" element={<InvoicesPage />} />
        <Route path="/sales/invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="/sales/payments" element={<PaymentsPage />} />

        {/* Purchase */}
        <Route path="/purchase/orders" element={<PurchaseOrdersPage />} />
        <Route path="/purchase/orders/:id" element={<PurchaseOrderDetailPage />} />
        <Route path="/purchase/bills" element={<VendorBillsPage />} />
        <Route path="/purchase/bills/:id" element={<VendorBillDetailPage />} />
        <Route path="/purchase/payments" element={<PurchasePaymentsPage />} />

        {/* Accounting */}
        <Route path="/accounting/journal-entries" element={<JournalEntriesPage />} />
        <Route path="/accounting/journal-entries/:id" element={<JournalEntryDetailPage />} />
        <Route path="/accounting/ledger" element={<GeneralLedgerPage />} />
        <Route path="/accounting/taxes" element={<TaxesPage />} />
        <Route path="/accounting/analytic-accounts" element={<AnalyticAccountsPage />} />

        {/* Budgeting */}
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/budgets/:id" element={<BudgetDetailPage />} />

        {/* Reports */}
        <Route path="/reports" element={<Navigate to="/reports/profit-loss" replace />} />
        <Route path="/reports/balance-sheet" element={<BalanceSheetPage />} />
        <Route path="/reports/profit-loss" element={<ProfitLossPage />} />
        <Route path="/reports/budget" element={<BudgetReportPage />} />

        {/* Settings */}
        <Route path="/settings" element={<Navigate to="/settings/general" replace />} />
        <Route path="/settings/general" element={<SettingsPage />} />
        <Route path="/settings/users" element={<SettingsPage />} />
        <Route path="/settings/roles" element={<SettingsPage />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
