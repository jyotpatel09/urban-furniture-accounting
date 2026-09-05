# Urban Furniture — Odoo Accounting ERP (Frontend)

Modern, enterprise-grade Single Page Application (SPA) for the **Urban Furniture Accounting System**, built for the **Odoo Hackathon Final Round**.

> **Note**: This repository contains the **Frontend prototype & static interactive demo**. The Node.js/Express/PostgreSQL REST API backend is developed separately.

---

## 🎯 Overview & Purpose
Urban Furniture Accounting ERP is a full-featured financial and operational management dashboard inspired by Odoo Accounting. It supports complete end-to-end business workflows, including customer master management, sales orders, invoicing, purchase orders, vendor bills, payment registration, double-entry journal vouchers (`JE-XXXXX`), general ledger, budget variance tracking, and real-time financial statements.

---

## 🚀 Key Modules Included
- **📊 Dashboard**: Dynamic financial overview, StatCards with embedded SVG sparklines (Total Sales, Total Purchases, Receivables, Payables, Net Profit, Cash & Bank), Sales vs Purchases bar chart, Revenue breakdown donut chart, and live activity feed.
- **📁 Master Data**:
  - **Contacts**: Customers, Vendors, and Dual contacts (`CUST-XXX`, `VEND-XXX`).
  - **Products**: Goods, Services, and Combos with stock tracking (`PROD-XXX`).
  - **Chart of Accounts**: Asset, Liability, Capital, Income, and Expense classifications.
  - **Journals**: Sales, Purchase, Bank, Cash, and General journals.
  - **Taxes**: GST 5%, GST 12%, GST 18%.
- **🛒 Sales Module**: Quotations, Sales Orders (`SO-XXXXX`), Customer Invoices (`INV-XXXXX`), and Payment collection (`PAY-C-XXXXX`).
- **📦 Purchase Module**: Purchase Orders (`PO-XXXXX`), Vendor Bills (`BILL-XXXXX`), Goods Receipt, and Disbursement (`PAY-V-XXXXX`).
- **📑 Accounting**: Double-entry Journal Entries (`JE-XXXXX`) and General Ledger with running balances.
- **🎯 Budgeting**: Budget allocation, analytic cost centers, and utilization percentage tracking.
- **📈 Reports**: Profit & Loss Statement, Balance Sheet ($\text{Assets} = \text{Liabilities} + \text{Capital}$), Budget Report, and Inventory Stock Report.
- **⚙️ Settings**: Enterprise company profile, currency, GSTIN, and accounting configuration.

---

## 💻 Technology Stack
- **Framework**: React 18.3 (Single Page Application)
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **Charts**: Recharts 2.12
- **State Management**: Zustand 4.5
- **Routing**: React Router DOM 6.23

---

## 🏁 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Access the application locally at `http://localhost:5173/`.

### 3. Production Build
```bash
npm run build
```
Generates optimized production assets in the `dist/` directory.

---

## 📁 Directory Structure
```
├── public/
├── src/
│   ├── assets/               # Static assets & brand logos
│   ├── components/           # Common UI primitives, Layout, Sidebar, Navbar, WorkflowBanner
│   ├── data/                 # Initial mock data & demo datasets
│   ├── pages/                # Page components divided by module domain
│   │   ├── accounting/       # Journal Entries, Ledger, Analytic Accounts, Taxes
│   │   ├── budgets/          # Budgets list & detail view
│   │   ├── dashboard/        # Executive Dashboard
│   │   ├── master/           # Contacts & Products detail views
│   │   ├── purchase/         # POs, Vendor Bills, Purchase Payments
│   │   ├── reports/          # P&L, Balance Sheet, Budget & Stock Reports
│   │   ├── sales/            # Sales Orders, Invoices, Sales Payments
│   │   └── settings/         # Settings page
│   ├── services/             # Mock service layer
│   ├── store/                # Zustand global state store
│   ├── App.jsx               # App routing & provider layout
│   ├── main.jsx              # Application entrypoint
│   └── index.css             # Tailwind & base CSS definitions
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 📄 License
Created for Odoo Hackathon Final Round — Urban Furniture ERP Project.
