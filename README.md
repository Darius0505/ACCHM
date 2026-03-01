# ACCHM - Enterprise Accounting System

Professional accounting application built with Next.js 13 and MS SQL Server.

## 🎯 Features

### Core Accounting
- **Chart of Accounts**: TT200 compliant account structure
- **Journal Entries**: Double-entry bookkeeping with posting workflow
- **General Ledger**: Account transaction history
- **Trial Balance**: Debit/Credit verification

### Cash & Bank Management
- Cash Receipts & Payments
- Bank Deposits & Withdrawals
- Cash Book & Bank Book reports

### Accounts Receivable (AR)
- Customer Management
- Sales Invoices
- Customer Payments
- AR Aging Report

### Accounts Payable (AP)
- Vendor Management
- Purchase Invoices
- Vendor Payments
- AP Aging Report

### Financial Reports
- Income Statement (P&L)
- Balance Sheet

### System Security
- JWT Authentication
- Role-Based Access Control (RBAC)
- Audit Logging

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 13, React, TailwindCSS, TypeScript |
| Backend | Next.js API Routes |
| Database | MS SQL Server (via Prisma ORM) |
| Auth | Custom JWT (jose, bcryptjs) |
| Testing | Jest |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MS SQL Server (local or Docker)

### Installation

1.  **Clone & Install**:
    ```bash
    cd acchm
    npm install
    ```

2.  **Environment Variables**:
    Create `.env` file:
    ```env
    DATABASE_URL="sqlserver://localhost:1433;database=acchm;user=sa;password=YourPassword;encrypt=true;trustServerCertificate=true"
    JWT_SECRET="your-super-secret-key-min-32-chars"
    ```

3.  **Database Setup**:
    ```bash
    npx prisma generate
    npx prisma db push
    npx prisma db seed
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000)

### Default Login
- **Email**: `admin@demo.com.vn`
- **Password**: `admin123`

---

## 📂 Project Structure

```
acchm/
├── prisma/              # Database schema & seed
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # Reusable UI components
│   ├── lib/             # Utilities (Prisma, Auth)
│   ├── services/        # Business logic layer
│   └── __tests__/       # Jest unit tests
├── plans/               # Phase documentation
└── README.md
```

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage
```

---

## 📋 Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm test` | Run Jest tests |
| `npx prisma studio` | Open Prisma database GUI |
| `npx prisma db seed` | Seed initial data |

---

## 📄 License

Private - Internal Use Only
