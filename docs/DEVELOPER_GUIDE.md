# ACCHM Developer Guide

Welcome to the **ACCHM ERP** project. This document serves as the primary technical guide for developers joined to the project.

## 1. Project Overview

ACCHM is a modern ERP (Enterprise Resource Planning) system specializing in accounting, focusing on the Vietnamese market (compliant with TT200/TT133 standards).

### Tech Stack
- **Framework**: [Next.js 13.5+](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Database**: SQL Server (managed via [Prisma ORM](https://www.prisma.io/))
- **Authentication**: NextAuth.js
- **UI Components**: Tailwind CSS, Shadcn UI, Radix UI
- **Data Grid**: [AG Grid Community](https://www.ag-grid.com/)
- **Reports**: `@react-pdf/renderer` for PDF generation, `exceljs` for exports.

---

## 2. Core Architecture

The project follows a **Master-Detail** architectural pattern, particularly optimized for accounting vouchers.

### Master Controller Pattern
Most "Voucher" types (Cash Receipts, Payments, Journal Entries) share a unified execution path.

- **Frontend**: `useVoucherCore` hook manages form state, loading, and action execution.
- **Master API**: `/api/vouchers/execute` acts as a central hub for all voucher actions (SAVE, DELETE, COPY).
- **Service Layer**: Business logic is encapsulated in `src/services/` (e.g., `cashReceipt.service.ts`).

### Data Flow
1. User interacts with a form component (e.g., `CashReceiptForm.tsx`).
2. The form uses `useVoucherCore` to hold state.
3. On "Save", `useVoucherCore` calls the `/api/vouchers/execute` endpoint.
4. The API runs validaton rules (`Sys_VoucherRule`) and workflow steps (`Sys_VoucherWorkflow`).
5. Workflow steps call the underlying services to persist data to SQL Server via Prisma.

---

## 3. Directory Structure

```text
src/
├── app/                  # Next.js App Router (Pages & APIs)
│   ├── api/vouchers/     # Core Voucher Engine APIs
│   └── (dashboard)/      # Protected dashboard routes
├── components/           # UI Components
│   ├── core/             # Framework-level components (AG Grid, Toolbar)
│   └── ui/               # Shadcn / shared UI atoms
├── lib/                  # Shared utilities (Prisma client, Auth)
├── services/             # Business Logic (Persistence, Posting, GL)
└── messages/             # i18n localization files
prisma/                   # DB Schema and Migrations
```

---

## 4. Key Developer Workflows

### Adding a New Voucher Type
1. **Schema**: Add models to `schema.prisma` (Follow Master-Detail naming).
2. **Service**: Create a service in `src/services/` (Create, Update, Delete, Post).
3. **API Configuration**: Add entries to `Sys_VoucherWorkflow` to link the new journal code to your service.
4. **UI**: Create a form using `useVoucherCore` and `DynamicAccountingGrid`.

### Implementing Posting Logic
All GL (General Ledger) postings should be handled within a Prisma transaction (`prisma.$transaction`) in the service layer to ensure data integrity between the Voucher and the Journal Entry.

---

## 5. Module Layout Blueprint & Standard Patterns

### Overview
All "Voucher" modules in ACCHM follow a standardized **Master-Detail layout pattern**. This ensures consistency, maintainability, and rapid development.

**See:** [Blueprint: Master-Detail Module Layout Pattern](./BLUEPRINT_MODULE_LAYOUT_PATTERN.md)

### Quick Reference

#### Architecture
- **Layout**: 2-column Flexbox (Sidebar + Main form)
- **Sidebar**: List with filters (date range, search) + item selection
- **Main Area**: Stateless form component (receives `id`, `onSuccess`, `onCancel` as props)
- **Sidebar Collapse**: Responsive toggle button when collapsed

#### Must-Haves ✅
1. **Master-Detail Layout Separation** - Clear visual separation using Flexbox
2. **Stateless Child Form Component** - Form is props-based, no parent state mutations
3. **Filter State Triggers Refetch** - `useEffect` with explicit dependency array for date filters

#### Must-Nots ❌
1. **No Inline Styles** - Use Tailwind classes instead (e.g., `className="flex flex-col"`)
2. **No Hard-Coded Company ID** - Use `useCompanyInfo()` hook from context
3. **No Silent Errors** - All API errors must show toast notifications

#### Data Flow
```
User Input (filters, search, select) 
  → State Update (useState)
  → API Fetch (useEffect) or Local Filter
  → Component Re-render
  → Form Selection → Child Component Loads
  → Form Submit → onSuccess Callback
  → Parent Refetch List
```

#### Example Modules Using This Blueprint
- ✅ Cash Receipt (`src/app/(dashboard)/cash-receipts/page.tsx`)
- ⏳ Cash Payment (follow same pattern)
- ⏳ Bank Transaction (follow same pattern)
- ⏳ Warehouse Transactions (follow same pattern)

### For Builders: Quick Implementation
When creating a new module (e.g., Cash Payment):
1. Read [Blueprint: Master-Detail Module Layout Pattern](./BLUEPRINT_MODULE_LAYOUT_PATTERN.md) - Section F (Reference Implementation)
2. Copy the skeleton code from **Section F.2** into your new page component
3. Replace `[ModuleName]`, `[moduleName]`, `[module-name]` with your actual names
4. Ensure you follow all Must-Haves ✅ and avoid Must-Nots ❌
5. Reference current Cash Receipt implementation as a working example

---

## 6. Resources
- [Voucher Engine Deep Dive](./VOUCHER_ENGINE.md)
- [UI & UX Standards](./UI_STANDARDS.md)
- [Module Layout Blueprint & Patterns](./BLUEPRINT_MODULE_LAYOUT_PATTERN.md) ⭐ **NEW**
- [Product Spec: Minimal Accounting](./PRODUCT_SPEC_MINIMAL_ACCOUNTING.md)
