# Urban Furniture Accounting ERP — Backend REST API

Production-grade monolithic REST API backend for the **Urban Furniture Accounting ERP System** built for the **Odoo Hackathon Final Round**.

---

## 🛠️ Technology Stack
- **Runtime**: Node.js v24.12.0
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma ORM v5.22.0
- **Authentication**: JWT stored in HTTP-Only Secure Cookie + Role-Based Access Control (RBAC)
- **Validation**: Zod
- **Testing**: Jest + Supertest

---

## 📁 Directory Structure
```
backend/
├── prisma/
│   ├── schema.prisma          # PostgreSQL relational schema
│   └── seed.ts                # Database seed script
├── src/
│   ├── config/                # Environment & Database Prisma connection
│   ├── middleware/            # Auth, Role/RBAC, Validation, Errors, 404
│   ├── utils/                 # JWT, Password, Accounting Double-Entry Engine
│   ├── modules/               # 20 Modular API Feature Domains
│   ├── routes/                # Master API Router (/api)
│   ├── app.ts                 # Express Application
│   └── server.ts              # Server Entrypoint
├── tests/                     # Automated Jest & Supertest suites
├── .env                       # Environment configuration
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/urban_furniture_accounting?schema=public"
JWT_SECRET="urban_furniture_accounting_super_secret_jwt_key_2026"
JWT_EXPIRES_IN="1d"
FRONTEND_URL="http://localhost:5173"
COOKIE_NAME="ufa_session_token"
```

### 3. Database Migration & Seeding
```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Run Automated Tests
```bash
npm test
```

---

## 🔒 Security & RBAC Roles
1. **ADMIN**: Full access to master data, transactions, accounting entries, reports, users.
2. **ACCOUNTANT**: Access to record transactions, confirm invoices, register payments, and view financial statements.
3. **CONTACT**: Restricted portal access to view own invoices, payments, and account balances.
