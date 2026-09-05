# Urban Furniture Accounting ERP — REST API Documentation

## Overview
This document specifies the complete REST API specification for the Urban Furniture Accounting System (Odoo Hackathon Final Round).

- **Base URL**: `http://localhost:5000/api`
- **Authentication**: JWT Cookie (`ufa_session_token`) or `Authorization: Bearer <token>`
- **Roles**: `ADMIN`, `ACCOUNTANT`, `CONTACT`

---

## 1. Authentication (`/api/auth`)
| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive HTTP-only JWT cookie |
| `POST` | `/api/auth/logout` | Authenticated | Clear session cookie |
| `GET` | `/api/auth/me` | Authenticated | Get current authenticated user profile |

---

## 2. Master Data APIs

### Contacts (`/api/contacts`)
- `GET /api/contacts` — List contacts (search, type filter `CUSTOMER`\|`VENDOR`\|`BOTH`, pagination)
- `GET /api/contacts/:id` — Get contact details + recent orders/invoices/payments
- `POST /api/contacts` — Create contact (`ADMIN`, `ACCOUNTANT`)
- `PATCH /api/contacts/:id` — Update contact (`ADMIN`, `ACCOUNTANT`)
- `DELETE /api/contacts/:id` — Archive contact (`ADMIN`)

### Products & Inventory (`/api/products`)
- `GET /api/products` — List products (search, category, type `GOODS`\|`SERVICE`\|`COMBO`)
- `GET /api/products/:id` — Get product details
- `POST /api/products` — Create product (`ADMIN`, `ACCOUNTANT`)
- `PATCH /api/products/:id` — Update product (`ADMIN`, `ACCOUNTANT`)
- `DELETE /api/products/:id` — Archive product (`ADMIN`)
- `GET /api/products/stock` — Inventory stock movement & valuation report

### Chart of Accounts (`/api/accounts`)
- `GET /api/accounts` — List chart of accounts (`ASSET`, `LIABILITY`, `CAPITAL`, `INCOME`, `EXPENSE`)
- `GET /api/accounts/:id` — Account details
- `GET /api/accounts/:id/ledger` — Account-specific ledger with opening & closing balance
- `POST /api/accounts` — Create account (`ADMIN`, `ACCOUNTANT`)
- `PATCH /api/accounts/:id` — Update account (`ADMIN`, `ACCOUNTANT`)
- `DELETE /api/accounts/:id` — Archive account (blocked if account has posted journal entries)

### Journals & Taxes
- `GET /api/journals` — List Journals (`SJ`, `PJ`, `BNK`, `CSH`)
- `GET /api/taxes` — List Tax rates (`GST 5%`, `GST 12%`, `GST 18%`)
- `GET /api/analytic-accounts` — List Analytic Cost Centers

---

## 3. Transaction & Accounting Workflows

### Sales Orders (`/api/sales-orders`)
- `GET /api/sales-orders` — List sales orders
- `POST /api/sales-orders` — Create Sales Order (`DRAFT`)
- `POST /api/sales-orders/:id/confirm` — Confirm order (`CONFIRMED`)
- `POST /api/sales-orders/:id/cancel` — Cancel order (`CANCELLED`)

### Customer Invoices (`/api/invoices`)
- `GET /api/invoices` — List customer invoices
- `POST /api/invoices` — Create Invoice (`DRAFT`)
- `POST /api/invoices/:id/post` — **POST Invoice**:
  - Automatically generates balanced double-entry `JournalEntry` (`JE-XXXXX`):
    - **Debit**: Debtors (`103000`) ₹Total
    - **Credit**: Sales Income (`401000`) ₹Subtotal
    - **Credit**: GST Payable (`202000`) ₹Tax
  - Enforces `Total Debit === Total Credit` inside atomic `prisma.$transaction`.

### Purchase Orders & Vendor Bills (`/api/purchase-orders`, `/api/vendor-bills`)
- `POST /api/purchase-orders/:id/receive` — Goods received -> increments product stock.
- `POST /api/vendor-bills/:id/post` — **POST Vendor Bill**:
  - Automatically generates balanced double-entry `JournalEntry` (`JE-XXXXX`):
    - **Debit**: Purchase Expense (`501000`) ₹Subtotal
    - **Debit**: GST Input Credit (`202000`) ₹Tax
    - **Credit**: Creditors (`201000`) ₹Total

### Payments (`/api/payments`)
- `POST /api/payments` — Register Customer or Vendor Payment:
  - Validates amount does NOT exceed remaining balance.
  - Updates document `paidAmount`, `remainingAmount`, and status (`PAID` or `PARTIALLY_PAID`).
  - Generates Payment Journal Entry:
    - Customer: **Debit** HDFC Bank (`102000`) / **Credit** Debtors (`103000`).
    - Vendor: **Debit** Creditors (`201000`) / **Credit** HDFC Bank (`102000`).

---

## 4. General Ledger & Financial Reports
- `GET /api/ledger` — General Ledger with server-side running balance (`previousBalance + debit - credit`).
- `GET /api/reports/profit-loss` — Live P&L (`Net Profit = Income - Expenses`) from posted journal entries.
- `GET /api/reports/balance-sheet` — Live Balance Sheet (`Assets = Liabilities + Capital`).
- `GET /api/budgets` — Live Budget variance and utilization based on tagged posted transactions.
- `GET /api/dashboard/summary` — Live calculated dashboard KPIs (Total Sales, Purchases, Receivables, Payables, Net Profit, Cash & Bank).

---

## 5. Contact Portal (`/api/portal`)
- `GET /api/portal/me` — Authenticated contact profile.
- `GET /api/portal/invoices` — List invoices linked to user's `contactId`.
- `GET /api/portal/payments` — List payment history linked to user's `contactId`.
