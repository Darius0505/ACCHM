# Phase 01: Database Schema

**Status:** ⬜ Pending  
**Dependencies:** None  
**Estimated:** 2 sessions

---

## Objective

Thiết kế và implement database schema đầy đủ cho Module Kế Toán, bao gồm tất cả các bảng cần thiết cho MVP.

---

## Requirements

### Functional
- [ ] Schema hỗ trợ multi-company
- [ ] Schema hỗ trợ multi-currency
- [ ] Schema tuân thủ VAS (TT200/TT133)
- [ ] Hỗ trợ fiscal year và accounting period
- [ ] Audit trail cho mọi thay đổi

### Non-Functional
- [ ] Performance: Index cho các query thường dùng
- [ ] Security: Soft delete thay vì hard delete
- [ ] Scalability: Thiết kế cho multi-tenant

---

## Database Models

### 0. AID Auto-Generated ID

> **AID Format:** `YYYYMMDD` + 7-digit sequence
> Example: `202601201000001`, `202601201000002`, ...

```prisma
// AID Generator - Stored procedure/function sẽ tạo AID
// Format: YYYYMMDD + 1000000 + sequence
// Ví dụ: 20260120 + 1000001 = 202601201000001

model AIDSequence {
  id          String   @id @default(uuid())
  companyId   String
  entityType  String   // JOURNAL_ENTRY, INVOICE, CASH_RECEIPT, etc.
  datePrefix  String   // "20260120"
  lastNumber  Int      @default(1000000)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([companyId, entityType, datePrefix])
}
```

**Helper function để generate AID:**
```typescript
async function generateAID(companyId: string, entityType: string): Promise<string> {
  const today = new Date();
  const datePrefix = format(today, 'yyyyMMdd'); // "20260120"
  
  // Upsert sequence record
  const sequence = await prisma.aIDSequence.upsert({
    where: {
      companyId_entityType_datePrefix: { companyId, entityType, datePrefix }
    },
    update: {
      lastNumber: { increment: 1 }
    },
    create: {
      companyId,
      entityType,
      datePrefix,
      lastNumber: 1000001
    }
  });
  
  return `${datePrefix}${sequence.lastNumber}`; // "202601201000001"
}
```

---

### 1. Company & Configuration

```prisma
model Company {
  id            String   @id @default(uuid())
  aid           String   @unique // Auto-generated: YYYYMMDD + 1000000+
  code          String   @unique
  
  // Multi-language names
  name          String   // Vietnamese (default)
  nameEN        String?  // English
  nameJP        String?  // Japanese
  nameOther     String?  // Other language (configurable)
  
  taxCode       String?
  address       String?
  phone         String?
  email         String?
  logo          String?
  currency      String   @default("VND")
  
  // Fiscal year settings
  fiscalYearStart Int    @default(1) // Month 1-12
  
  // Accounting settings
  accountingStandard String @default("TT200") // TT200, TT133
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?
  
  // Relations
  fiscalYears   FiscalYear[]
  accounts      Account[]
  partners      Partner[]
  bankAccounts  BankAccount[]
  journals      Journal[]
  aidSequences  AIDSequence[]
}
```

### 2. Fiscal Year & Accounting Periods

```prisma
model FiscalYear {
  id          String   @id @default(uuid())
  aid         String   @unique // Auto-generated AID
  companyId   String
  company     Company  @relation(fields: [companyId], references: [id])
  
  // Multi-language names
  name        String   // Vietnamese: "Năm tài chính 2026"
  nameEN      String?  // English: "Fiscal Year 2026"
  nameJP      String?  // Japanese
  nameOther   String?
  
  year        Int      // 2026
  startDate   DateTime // Ngày bắt đầu kỳ kế toán
  endDate     DateTime
  
  // Status workflow: OPEN → SOFT_CLOSED → HARD_CLOSED → LOCKED
  status      FiscalYearStatus @default(OPEN)
  
  // Close tracking
  softClosedAt  DateTime?  // Khoá sổ tạm (vẫn có thể mở lại)
  softClosedBy  String?
  hardClosedAt  DateTime?  // Đóng sổ (kết chuyển, không sửa được)
  hardClosedBy  String?
  lockedAt      DateTime?  // Khoá vĩnh viễn
  lockedBy      String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  periods     AccountingPeriod[]
  
  @@unique([companyId, year])
  @@index([companyId, status])
}

enum FiscalYearStatus {
  OPEN          // Đang mở - có thể nhập liệu
  SOFT_CLOSED   // Khóa sổ tạm - chờ kiểm tra, có thể mở lại
  HARD_CLOSED   // Đóng sổ - đã kết chuyển, không sửa được
  LOCKED        // Khoá vĩnh viễn - đã quyết toán thuế
}

model AccountingPeriod {
  id            String   @id @default(uuid())
  aid           String   @unique // Auto-generated AID
  fiscalYearId  String
  fiscalYear    FiscalYear @relation(fields: [fiscalYearId], references: [id])
  
  // Multi-language names  
  name          String   // "Tháng 01/2026"
  nameEN        String?  // "January 2026"
  nameJP        String?  // "2026年1月"
  nameOther     String?
  
  periodNumber  Int      // 1-12 (hoặc 1-13 cho period đặc biệt)
  startDate     DateTime // Ngày bắt đầu kỳ
  endDate       DateTime
  
  // Status workflow: OPEN → SOFT_CLOSED → HARD_CLOSED
  status        PeriodStatus @default(OPEN)
  
  // Close tracking
  softClosedAt  DateTime?  // Khoá sổ tạm
  softClosedBy  String?
  hardClosedAt  DateTime?  // Đóng sổ chính thức
  hardClosedBy  String?
  
  // Closing entries
  closingEntryId String?  // Bút toán kết chuyển
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([fiscalYearId, periodNumber])
  @@index([fiscalYearId, status])
}

enum PeriodStatus {
  OPEN          // Đang mở - có thể nhập liệu
  SOFT_CLOSED   // Khóa sổ tạm - chờ review, có thể mở lại
  HARD_CLOSED   // Đóng sổ - đã kết chuyển cuối kỳ
}
```

**Period Close Workflow:**
```
┌────────┐    Soft Close    ┌─────────────┐    Hard Close    ┌─────────────┐
│  OPEN  │ ───────────────► │ SOFT_CLOSED │ ───────────────► │ HARD_CLOSED │
└────────┘                  └─────────────┘                  └─────────────┘
    ▲                            │
    │         Reopen             │
    └────────────────────────────┘
```

**Fiscal Year Close:**
```
1. OPEN → Có thể nhập chứng từ
2. SOFT_CLOSED → Kiểm tra, đối chiếu (có thể mở lại)
3. HARD_CLOSED → Kết chuyển 911, lập BCTC (không sửa được)
4. LOCKED → Đã quyết toán thuế (khóa vĩnh viễn)
```

### 3. Chart of Accounts (Mở rộng)

```prisma
model Account {
  id            String   @id @default(uuid())
  aid           String   @unique // Auto-generated AID: YYYYMMDD + 1000000+
  companyId     String
  company       Company  @relation(fields: [companyId], references: [id])
  
  code          String   // "111", "112", "131"...
  
  // Multi-language names (thống nhất format)
  name          String   // Vietnamese (default): "Tiền mặt"
  nameEN        String?  // English: "Cash"
  nameJP        String?  // Japanese: "現金"
  nameOther     String?  // Other language (Korean, Chinese, etc.)
  
  type          AccountType    // ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
  nature        AccountNature  // DEBIT, CREDIT
  level         Int           // 1, 2, 3...
  isPosting     Boolean  @default(true)
  isActive      Boolean  @default(true)
  
  parentId      String?
  parent        Account? @relation("AccountHierarchy", fields: [parentId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  children      Account[] @relation("AccountHierarchy")
  
  // Opening balance
  openingDebit  Decimal  @default(0) @db.Decimal(18, 2)
  openingCredit Decimal  @default(0) @db.Decimal(18, 2)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?
  
  journalEntries JournalEntryLine[]
  
  @@unique([companyId, code])
  @@index([companyId, type])
  @@index([parentId])
  @@index([aid])
}

enum AccountType {
  ASSET
  LIABILITY
  EQUITY
  REVENUE
  EXPENSE
}

enum AccountNature {
  DEBIT
  CREDIT
}
```

### 4. Partners (Customers & Vendors)

```prisma
model Partner {
  id            String   @id @default(uuid())
  aid           String   @unique // Auto-generated AID
  companyId     String
  company       Company  @relation(fields: [companyId], references: [id])
  
  code          String
  
  // Multi-language names
  name          String   // Vietnamese
  nameEN        String?  // English
  nameJP        String?  // Japanese
  nameOther     String?  // Other
  
  type          PartnerType  // CUSTOMER, VENDOR, BOTH
  
  taxCode       String?
  address       String?
  phone         String?
  email         String?
  contactPerson String?
  
  // Credit terms
  paymentTermDays Int     @default(30)
  creditLimit     Decimal? @db.Decimal(18, 2)
  
  // Default accounts
  receivableAccountId String?
  payableAccountId    String?
  
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?
  
  invoices      Invoice[]
  payments      Payment[]
  cashReceipts  CashReceipt[]
  cashPayments  CashPayment[]
  
  @@unique([companyId, code])
  @@index([companyId, type])
  @@index([aid])
}

enum PartnerType {
  CUSTOMER
  VENDOR
  BOTH
}
```

### 5. Bank Accounts

```prisma
model BankAccount {
  id            String   @id @default(uuid())
  companyId     String
  company       Company  @relation(fields: [companyId], references: [id])
  
  code          String
  name          String
  bankName      String
  accountNumber String
  branch        String?
  currency      String   @default("VND")
  
  // Linked GL account
  accountId     String
  
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  transactions  BankTransaction[]
  
  @@unique([companyId, code])
}
```

### 6. Journals

```prisma
model Journal {
  id            String   @id @default(uuid())
  companyId     String
  company       Company  @relation(fields: [companyId], references: [id])
  
  code          String
  name          String
  type          JournalType  // GENERAL, CASH, BANK, SALES, PURCHASE
  
  // Default accounts
  defaultDebitAccountId  String?
  defaultCreditAccountId String?
  
  // Sequence
  prefix        String?      // "GJ", "CR", "CP"...
  nextNumber    Int    @default(1)
  
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  entries       JournalEntry[]
  
  @@unique([companyId, code])
}

enum JournalType {
  GENERAL     // Nhật ký chung
  CASH        // Nhật ký tiền mặt
  BANK        // Nhật ký ngân hàng
  SALES       // Nhật ký bán hàng
  PURCHASE    // Nhật ký mua hàng
}
```

### 7. Journal Entries (Bút toán)

```prisma
model JournalEntry {
  id            String   @id @default(uuid())
  aid           String   @unique // Auto-generated AID: 202601201000001
  journalId     String
  journal       Journal  @relation(fields: [journalId], references: [id])
  
  entryNumber   String   // "GJ-2026-00001" (human-readable)
  date          DateTime
  postingDate   DateTime
  
  // Link to accounting period (để kiểm tra period đóng/mở)
  periodId      String?
  
  reference     String?  // Số chứng từ gốc
  
  // Multi-language description
  description   String   // Vietnamese
  descriptionEN String?  // English
  descriptionJP String?  // Japanese
  descriptionOther String?
  
  status        EntryStatus @default(DRAFT) // DRAFT, POSTED, CANCELLED
  
  // Totals
  totalDebit    Decimal  @db.Decimal(18, 2)
  totalCredit   Decimal  @db.Decimal(18, 2)
  
  // Audit
  createdBy     String
  postedBy      String?
  postedAt      DateTime?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  lines         JournalEntryLine[]
  
  // Source documents
  cashReceipt   CashReceipt?
  cashPayment   CashPayment?
  bankTransaction BankTransaction?
  invoice       Invoice?
  payment       Payment?
  
  @@index([journalId, date])
  @@index([entryNumber])
  @@index([aid])
  @@index([periodId])
}

model JournalEntryLine {
  id            String   @id @default(uuid())
  entryId       String
  entry         JournalEntry @relation(fields: [entryId], references: [id], onDelete: Cascade)
  
  lineNumber    Int
  accountId     String
  account       Account  @relation(fields: [accountId], references: [id])
  
  description   String?
  
  debit         Decimal  @default(0) @db.Decimal(18, 2)
  credit        Decimal  @default(0) @db.Decimal(18, 2)
  
  // Analytic
  partnerId     String?
  
  createdAt     DateTime @default(now())
  
  @@index([entryId])
  @@index([accountId])
}

enum EntryStatus {
  DRAFT
  POSTED
  CANCELLED
}
```

### 8. Cash Management

```prisma
model CashReceipt {
  id            String   @id @default(uuid())
  companyId     String
  
  receiptNumber String   // "PT-2026-00001"
  date          DateTime
  
  partnerId     String?
  partner       Partner? @relation(fields: [partnerId], references: [id])
  
  amount        Decimal  @db.Decimal(18, 2)
  description   String
  
  // Journal entry
  journalEntryId String? @unique
  journalEntry   JournalEntry? @relation(fields: [journalEntryId], references: [id])
  
  status        String   @default("DRAFT") // DRAFT, POSTED, CANCELLED
  
  createdBy     String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([companyId, date])
}

model CashPayment {
  id            String   @id @default(uuid())
  companyId     String
  
  paymentNumber String   // "PC-2026-00001"
  date          DateTime
  
  partnerId     String?
  partner       Partner? @relation(fields: [partnerId], references: [id])
  
  amount        Decimal  @db.Decimal(18, 2)
  description   String
  
  // Journal entry
  journalEntryId String? @unique
  journalEntry   JournalEntry? @relation(fields: [journalEntryId], references: [id])
  
  status        String   @default("DRAFT")
  
  createdBy     String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([companyId, date])
}
```

### 9. Bank Transactions

```prisma
model BankTransaction {
  id              String   @id @default(uuid())
  bankAccountId   String
  bankAccount     BankAccount @relation(fields: [bankAccountId], references: [id])
  
  transactionNumber String
  date            DateTime
  type            BankTransactionType // DEPOSIT, WITHDRAWAL, TRANSFER
  
  partnerId       String?
  
  amount          Decimal  @db.Decimal(18, 2)
  description     String
  reference       String?  // Bank reference
  
  // Journal entry
  journalEntryId  String? @unique
  journalEntry    JournalEntry? @relation(fields: [journalEntryId], references: [id])
  
  status          String   @default("DRAFT")
  
  createdBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([bankAccountId, date])
}

enum BankTransactionType {
  DEPOSIT      // Báo có
  WITHDRAWAL   // Báo nợ
  TRANSFER     // Chuyển khoản nội bộ
}
```

### 10. Invoices (AR/AP)

```prisma
model Invoice {
  id            String   @id @default(uuid())
  companyId     String
  
  invoiceNumber String
  type          InvoiceType  // SALES, PURCHASE
  date          DateTime
  dueDate       DateTime
  
  partnerId     String
  partner       Partner  @relation(fields: [partnerId], references: [id])
  
  // Amounts
  subtotal      Decimal  @db.Decimal(18, 2)
  taxAmount     Decimal  @default(0) @db.Decimal(18, 2)
  totalAmount   Decimal  @db.Decimal(18, 2)
  paidAmount    Decimal  @default(0) @db.Decimal(18, 2)
  balanceAmount Decimal  @db.Decimal(18, 2)
  
  description   String?
  
  // Journal entry
  journalEntryId String? @unique
  journalEntry   JournalEntry? @relation(fields: [journalEntryId], references: [id])
  
  status        InvoiceStatus @default(DRAFT)
  paymentStatus PaymentStatus @default(UNPAID)
  
  createdBy     String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  lines         InvoiceLine[]
  payments      PaymentAllocation[]
  
  @@unique([companyId, invoiceNumber, type])
  @@index([companyId, partnerId])
  @@index([companyId, type, status])
}

model InvoiceLine {
  id            String   @id @default(uuid())
  invoiceId     String
  invoice       Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  
  lineNumber    Int
  description   String
  accountId     String
  
  quantity      Decimal  @default(1) @db.Decimal(18, 4)
  unitPrice     Decimal  @db.Decimal(18, 2)
  amount        Decimal  @db.Decimal(18, 2)
  
  taxRate       Decimal  @default(0) @db.Decimal(5, 2)
  taxAmount     Decimal  @default(0) @db.Decimal(18, 2)
  
  @@index([invoiceId])
}

enum InvoiceType {
  SALES       // Hóa đơn bán
  PURCHASE    // Hóa đơn mua
}

enum InvoiceStatus {
  DRAFT
  POSTED
  CANCELLED
}

enum PaymentStatus {
  UNPAID
  PARTIAL
  PAID
}
```

### 11. Payments

```prisma
model Payment {
  id            String   @id @default(uuid())
  companyId     String
  
  paymentNumber String
  type          PaymentType  // RECEIPT, PAYMENT
  date          DateTime
  
  partnerId     String
  partner       Partner  @relation(fields: [partnerId], references: [id])
  
  amount        Decimal  @db.Decimal(18, 2)
  paymentMethod String   // CASH, BANK, CHECK
  bankAccountId String?
  
  description   String?
  
  // Journal entry
  journalEntryId String? @unique
  journalEntry   JournalEntry? @relation(fields: [journalEntryId], references: [id])
  
  status        String   @default("DRAFT")
  
  createdBy     String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  allocations   PaymentAllocation[]
  
  @@index([companyId, partnerId])
}

model PaymentAllocation {
  id          String   @id @default(uuid())
  paymentId   String
  payment     Payment  @relation(fields: [paymentId], references: [id], onDelete: Cascade)
  
  invoiceId   String
  invoice     Invoice  @relation(fields: [invoiceId], references: [id])
  
  amount      Decimal  @db.Decimal(18, 2)
  
  createdAt   DateTime @default(now())
  
  @@index([paymentId])
  @@index([invoiceId])
}

enum PaymentType {
  RECEIPT     // Thu tiền từ KH
  PAYMENT     // Trả tiền cho NCC
}
```

### 12. Users & Audit

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  name          String
  password      String
  
  role          UserRole @default(USER)
  companyId     String?
  
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  auditLogs     AuditLog[]
}

model AuditLog {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  
  action        String   // CREATE, UPDATE, DELETE, POST, CANCEL
  entity        String   // JournalEntry, Invoice, Payment...
  entityId      String
  
  oldValues     String?  @db.NVarChar(Max) // JSON
  newValues     String?  @db.NVarChar(Max) // JSON
  
  ipAddress     String?
  userAgent     String?
  
  createdAt     DateTime @default(now())
  
  @@index([entity, entityId])
  @@index([userId, createdAt])
}

enum UserRole {
  ADMIN
  ACCOUNTANT
  USER
  VIEWER
}
```

---

## Implementation Steps

1. [ ] Backup current schema
2. [ ] Update `schema.prisma` with new models
3. [ ] Generate migration: `npx prisma migrate dev --name accounting_module`
4. [ ] Create seed data for Chart of Accounts (TT200)
5. [ ] Create seed data for Journals
6. [ ] Test database connection
7. [ ] Verify all relations work correctly

---

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Main schema file |
| `prisma/seed.ts` | Seed data (accounts, journals) |
| `prisma/seeds/accounts-tt200.json` | Chart of Accounts TT200 |
| `prisma/seeds/accounts-tt133.json` | Chart of Accounts TT133 |

---

## Test Criteria

- [ ] All tables created successfully
- [ ] Foreign key relations work
- [ ] Seed data inserted
- [ ] Prisma Client generates correctly
- [ ] Basic CRUD operations work

---

## Notes

- Hiện tại model `Account` đã có, cần migrate sang schema mới
- Cần backup data trước khi migrate
- Consider using Prisma's `@@map` for Vietnamese table names if needed

---

**Next Phase:** [Phase 02 - Core Accounting](./phase-02-core-accounting.md)
