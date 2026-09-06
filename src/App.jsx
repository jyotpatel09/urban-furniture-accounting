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

import { useStore } from './store/useStore';
import { AccessDeniedPage } from './components/common/AccessDeniedPage';

// Settings Module
import { SettingsPage } from './pages/settings/SettingsPage';

function ProtectedRoute({ children, allowedRoles, moduleName }) {
  const user = useStore((state) => state.user);
  const currentRole = user?.role || 'Administrator';
  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    return <AccessDeniedPage moduleName={moduleName} />;
  }
  return children;
}

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
        
        <Route path="/accounts" element={
          <ProtectedRoute allowedRoles={['Administrator', 'Admin', 'Accountant']} moduleName="Chart of Accounts">
            <ChartOfAccountsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/journals" element={
          <ProtectedRoute allowedRoles={['Administrator', 'Admin', 'Accountant']} moduleName="Journals Configuration">
            <JournalsPage />
          </ProtectedRoute>
        } />

        {/* Sales */}
        <Route path="/sales/orders" element={
          <ProtectedRoute allowedRoles={['Administrator', 'Admin', 'Sales & Purchase User']} moduleName="Sales Orders Creation">
            <SalesOrdersPage />
          </ProtectedRoute>
        } />
        <Route path="/sales/orders/:id" element={
          <ProtectedRoute allowedRoles={['Administrator', 'Admin', 'Sales & Purchase User']} moduleName="Sales Order Detail">
            <SalesOrderDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/sales/invoices" element={<InvoicesPage />} />
        <Route path="/sales/invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="/sales/payments" element={<PaymentsPage />} />

        {/* Purchase */}
        <Route path="/purchase/orders" element={
          <ProtectedRoute allowedRoles={['Administrator', 'Admin', 'Sales & Purchase User']} moduleName="Purchase Orders Creation">
            <PurchaseOrdersPage />
          </ProtectedRoute>
        } />
        <Route path="/purchase/orders/:id" element={
          <ProtectedRoute allowedRoles={['Administrator', 'Admin', 'Sales & Purchase User']} moduleName="Purchase Order Detail">
            <PurchaseOrderDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/purchase/bills" element={<VendorBillsPage />} />
        <Route path="/purchase/bills/:id" element={<VendorBillDetailPage />} />
        <Route path="/purchase/payments" element={<PurchasePaymentsPage />} />

        {/* Accounting */}
        <Route path="/accounting/journal-entries" element={
          <ProtectedRoute allowedRoles={['Administrator', 'Admin', 'Accountant']} moduleName="Journal Entries Management">
            <JournalEntriesPage />
          </ProtectedRoute>
        } />
        <Route path="/accounting/journal-entries/:id" element={
          <ProtectedRoute allowedRoles={['Administrator', 'Admin', 'Accountant']} moduleName="Journal Entry Detail">
            <JournalEntryDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/accounting/ledger" element={
          <ProtectedRoute allowedRoles={['Administrator', 'Admin', 'Accountant']} moduleName="General Ledger">
            <GeneralLedgerPage />
          </ProtectedRoute>
        } />
        <Route path="/accounting/taxes" element={
          <ProtectedRoute allowedRoles={['Administrator', 'Admin', 'Accountant']} moduleName="Tax Configuration">
            <TaxesPage />
          </ProtectedRoute>
        } />
        <Route path="/accounting/analytic-accounts" element={
          <ProtectedRoute allowedRoles={['Administrator', 'Admin', 'Accountant']} moduleName="Analytic Cost Accounts">
            <AnalyticAccountsPage />
          </ProtectedRoute>
        } />

        {/* Budgeting */}
        <Route path="/budgets" element={
          <ProtectedRoute allowedRoles={['Administrator', 'Admin', 'Accountant']} moduleName="Budgets Management">
            <BudgetsPage />
          </ProtectedRoute>
        } />
        <Route path="/budgets/:id" element={
          <ProtectedRoute allowedRoles={['Administrator', 'Admin', 'Accountant']} moduleName="Budget Detail">
            <BudgetDetailPage />
          </ProtectedRoute>
        } />

        {/* Reports */}
        <Route path="/reports" element={<Navigate to="/reports/profit-loss" replace />} />
        <Route path="/reports/balance-sheet" element={
          <ProtectedRoute allowedRoles={['Administrator', 'Admin', 'Accountant']} moduleName="Balance Sheet Statement">
            <BalanceSheetPage />
          </ProtectedRoute>
        } />
        <Route path="/reports/profit-loss" element={
          <ProtectedRoute allowedRoles={['Administrator', 'Admin', 'Accountant']} moduleName="Profit & Loss Statement">
            <ProfitLossPage />
          </ProtectedRoute>
        } />
        <Route path="/reports/budget" element={
          <ProtectedRoute allowedRoles={['Administrator', 'Admin', 'Accountant']} moduleName="Budget Reports">
            <BudgetReportPage />
          </ProtectedRoute>
        } />

        {/* Settings */}
        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['Administrator', 'Admin']} moduleName="System Settings">
            <Navigate to="/settings/general" replace />
          </ProtectedRoute>
        } />
        <Route path="/settings/general" element={
          <ProtectedRoute allowedRoles={['Administrator', 'Admin']} moduleName="General Settings">
            <SettingsPage />
          </ProtectedRoute>
        } />
        <Route path="/settings/users" element={
          <ProtectedRoute allowedRoles={['Administrator', 'Admin']} moduleName="User Management">
            <SettingsPage />
          </ProtectedRoute>
        } />
        <Route path="/settings/roles" element={
          <ProtectedRoute allowedRoles={['Administrator', 'Admin']} moduleName="Role & Permission Administration">
            <SettingsPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
