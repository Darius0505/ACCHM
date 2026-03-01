# Phase 03: Cash & Bank Management

**Status:** ⬜ Pending  
**Dependencies:** Phase 02 (Core Accounting)  
**Estimated:** 2 sessions

---

## Objective

Implement quản lý tiền mặt và tiền gửi ngân hàng - các giao dịch thu/chi cơ bản nhất của kế toán.

---

## Requirements

### Functional
- [ ] Phiếu thu tiền mặt (Cash Receipt)
- [ ] Phiếu chi tiền mặt (Cash Payment)
- [ ] Sổ quỹ tiền mặt
- [ ] Báo nợ ngân hàng (Bank Deposit)
- [ ] Báo có ngân hàng (Bank Withdrawal)
- [ ] Sổ tiền gửi ngân hàng
- [ ] Auto-create journal entries

### Non-Functional
- [ ] Validation: Check sufficient cash balance
- [ ] Audit: Full transaction history
- [ ] Print: Receipt/Payment vouchers

---

## API Endpoints

### Cash Management

```typescript
// Cash Receipts (Phiếu thu)
POST   /api/cash-receipts              // Create receipt
GET    /api/cash-receipts              // List receipts
GET    /api/cash-receipts/:id          // Get receipt
PUT    /api/cash-receipts/:id          // Update draft
DELETE /api/cash-receipts/:id          // Delete draft
POST   /api/cash-receipts/:id/post     // Post receipt

// Cash Payments (Phiếu chi)
POST   /api/cash-payments              // Create payment
GET    /api/cash-payments              // List payments
GET    /api/cash-payments/:id          // Get payment
PUT    /api/cash-payments/:id          // Update draft
DELETE /api/cash-payments/:id          // Delete draft
POST   /api/cash-payments/:id/post     // Post payment

// Cash Book
GET    /api/cash-book                  // Get cash book
       ?startDate=xxx&endDate=xxx
```

### Bank Management

```typescript
// Bank Accounts
GET    /api/bank-accounts              // List bank accounts
POST   /api/bank-accounts              // Create bank account
GET    /api/bank-accounts/:id          // Get bank account
PUT    /api/bank-accounts/:id          // Update bank account

// Bank Transactions
POST   /api/bank-transactions          // Create transaction
GET    /api/bank-transactions          // List transactions
GET    /api/bank-transactions/:id      // Get transaction
PUT    /api/bank-transactions/:id      // Update draft
POST   /api/bank-transactions/:id/post // Post transaction

// Bank Book
GET    /api/bank-book                  // Get bank book
       ?bankAccountId=xxx
       ?startDate=xxx&endDate=xxx
```

---

## UI Components

### 1. Cash Receipt Form (Phiếu Thu)

```
┌─────────────────────────────────────────────────────────────────┐
│ PHIẾU THU                                              [Print]  │
├─────────────────────────────────────────────────────────────────┤
│ Số phiếu: PT-2026-00001              Ngày: [2026-01-20]        │
│                                                                 │
│ Người nộp tiền: [Nguyễn Văn A_______________] [🔍 Chọn KH]     │
│ Địa chỉ:        [123 Nguyễn Huệ, Q1, HCM___________________]   │
│                                                                 │
│ Lý do thu:      [Thu tiền bán hàng theo HĐ 001___________]     │
│                                                                 │
│ Số tiền:        [    10,000,000 ] VND                          │
│ Bằng chữ:       Mười triệu đồng chẵn                           │
│                                                                 │
│ Tài khoản Nợ:   [111 - Tiền mặt ▼]                             │
│ Tài khoản Có:   [131 - Phải thu KH ▼]                          │
│                                                                 │
│ Kèm theo: [1] chứng từ gốc                                     │
├─────────────────────────────────────────────────────────────────┤
│ Ghi chú: [_________________________________________________]   │
│                                                                 │
│                              [Hủy]  [Lưu nháp]  [Ghi sổ]       │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Cash Payment Form (Phiếu Chi)

```
┌─────────────────────────────────────────────────────────────────┐
│ PHIẾU CHI                                              [Print]  │
├─────────────────────────────────────────────────────────────────┤
│ Số phiếu: PC-2026-00001              Ngày: [2026-01-20]        │
│                                                                 │
│ Người nhận tiền: [Công ty ABC_______________] [🔍 Chọn NCC]    │
│ Địa chỉ:         [456 Lê Lợi, Q1, HCM_____________________]    │
│                                                                 │
│ Lý do chi:       [Thanh toán tiền hàng theo HĐ 002_______]     │
│                                                                 │
│ Số tiền:         [     5,000,000 ] VND                         │
│ Bằng chữ:        Năm triệu đồng chẵn                           │
│                                                                 │
│ Tài khoản Nợ:    [331 - Phải trả NCC ▼]                        │
│ Tài khoản Có:    [111 - Tiền mặt ▼]                            │
│                                                                 │
│ Kèm theo: [1] chứng từ gốc                                     │
├─────────────────────────────────────────────────────────────────┤
│ ⚠️ Số dư quỹ hiện tại: 15,000,000 VND                          │
│                                                                 │
│                              [Hủy]  [Lưu nháp]  [Ghi sổ]       │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Cash Book (Sổ Quỹ Tiền Mặt)

```
┌─────────────────────────────────────────────────────────────────┐
│ SỔ QUỸ TIỀN MẶT                                  [Export Excel]│
├─────────────────────────────────────────────────────────────────┤
│ Kỳ: [Từ 01/01/2026 đến 31/01/2026 ▼]                           │
├─────────────────────────────────────────────────────────────────┤
│ Số dư đầu kỳ:                                      10,000,000  │
├─────────────────────────────────────────────────────────────────┤
│ Ngày     │ Số CT         │ Diễn giải      │ Thu       │ Chi    │
│──────────┼───────────────┼────────────────┼───────────┼────────│
│ 02/01    │ PT-2026-00001 │ Thu tiền KH A  │ 5,000,000 │        │
│ 05/01    │ PC-2026-00001 │ Chi văn phòng  │           │ 500,000│
│ 10/01    │ PT-2026-00002 │ Thu tiền KH B  │ 2,000,000 │        │
│ 15/01    │ PC-2026-00002 │ Trả NCC ABC    │           │3,000,000│
├─────────────────────────────────────────────────────────────────┤
│ Cộng phát sinh:                           7,000,000   3,500,000│
│ Số dư cuối kỳ:                                      13,500,000 │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Bank Transaction Form

```
┌─────────────────────────────────────────────────────────────────┐
│ GIAO DỊCH NGÂN HÀNG                                            │
├─────────────────────────────────────────────────────────────────┤
│ Loại: [◉ Báo có (Thu)  ○ Báo nợ (Chi)]                         │
│                                                                 │
│ Số chứng từ: BC-2026-00001           Ngày: [2026-01-20]        │
│ Tài khoản NH: [Vietcombank 001234567890 ▼]                     │
│                                                                 │
│ Đối tượng:    [Công ty XYZ________________] [🔍]               │
│ Số tiền:      [    50,000,000 ] VND                            │
│ Diễn giải:    [Khách hàng chuyển khoản thanh toán HĐ 005]     │
│                                                                 │
│ Số tham chiếu NH: [VCB20260120001234_________________]         │
│                                                                 │
│ TK Nợ: [112 - TGNH ▼]          TK Có: [131 - Phải thu ▼]       │
├─────────────────────────────────────────────────────────────────┤
│ Số dư TK sau GD: 135,000,000 VND                               │
│                                                                 │
│                              [Hủy]  [Lưu nháp]  [Ghi sổ]       │
└─────────────────────────────────────────────────────────────────┘
```

### 5. Bank Book (Sổ Tiền Gửi Ngân Hàng)

```
┌─────────────────────────────────────────────────────────────────┐
│ SỔ TIỀN GỬI NGÂN HÀNG                            [Export Excel]│
├─────────────────────────────────────────────────────────────────┤
│ Tài khoản: [Vietcombank - 001234567890 ▼]                      │
│ Kỳ: [Từ 01/01/2026 đến 31/01/2026 ▼]                           │
├─────────────────────────────────────────────────────────────────┤
│ Số dư đầu kỳ:                                      85,000,000  │
├─────────────────────────────────────────────────────────────────┤
│ Ngày     │ Số CT         │ Diễn giải      │ Thu        │ Chi   │
│──────────┼───────────────┼────────────────┼────────────┼───────│
│ 03/01    │ BC-2026-00001 │ KH XYZ CK      │ 50,000,000 │       │
│ 08/01    │ BN-2026-00001 │ Trả NCC DEF    │            │20,000,000│
│ 12/01    │ BC-2026-00002 │ KH ABC CK      │ 30,000,000 │       │
├─────────────────────────────────────────────────────────────────┤
│ Cộng phát sinh:                          80,000,000  20,000,000│
│ Số dư cuối kỳ:                                     145,000,000 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Backend

1. [ ] Create Cash Receipt service
   - [ ] Create/Update/Delete/Post
   - [ ] Auto-create journal entry on post
   - [ ] Validate cash balance

2. [ ] Create Cash Payment service
   - [ ] Create/Update/Delete/Post
   - [ ] Check sufficient balance before post
   - [ ] Auto-create journal entry

3. [ ] Create Bank Transaction service
   - [ ] Support Deposit/Withdrawal/Transfer
   - [ ] Auto-create journal entry

4. [ ] Create Cash Book service
   - [ ] Calculate opening balance
   - [ ] List transactions for period
   - [ ] Calculate closing balance

5. [ ] Create Bank Book service
   - [ ] Per bank account
   - [ ] Period filtering

6. [ ] Create API routes

### Frontend

7. [ ] Cash Receipt pages
   - [ ] List page with filters
   - [ ] Create/Edit form
   - [ ] View/Print page

8. [ ] Cash Payment pages
   - [ ] List page with filters
   - [ ] Create/Edit form
   - [ ] Balance warning

9. [ ] Bank Account management
   - [ ] List bank accounts
   - [ ] Create/Edit bank account

10. [ ] Bank Transaction pages
    - [ ] List page
    - [ ] Create/Edit form

11. [ ] Cash Book page
    - [ ] Period selector
    - [ ] Export Excel

12. [ ] Bank Book page
    - [ ] Bank account selector
    - [ ] Export Excel

---

## Files to Create/Modify

### API Routes
| File | Purpose |
|------|---------|
| `src/app/api/cash-receipts/route.ts` | Cash receipt CRUD |
| `src/app/api/cash-receipts/[id]/route.ts` | Single receipt |
| `src/app/api/cash-receipts/[id]/post/route.ts` | Post receipt |
| `src/app/api/cash-payments/route.ts` | Cash payment CRUD |
| `src/app/api/cash-payments/[id]/route.ts` | Single payment |
| `src/app/api/cash-payments/[id]/post/route.ts` | Post payment |
| `src/app/api/bank-accounts/route.ts` | Bank account CRUD |
| `src/app/api/bank-transactions/route.ts` | Bank transaction CRUD |
| `src/app/api/cash-book/route.ts` | Cash book report |
| `src/app/api/bank-book/route.ts` | Bank book report |

### Services
| File | Purpose |
|------|---------|
| `src/services/cashReceipt.service.ts` | Cash receipt logic |
| `src/services/cashPayment.service.ts` | Cash payment logic |
| `src/services/bankTransaction.service.ts` | Bank transaction logic |
| `src/services/cashBook.service.ts` | Cash book report |
| `src/services/bankBook.service.ts` | Bank book report |

### UI Pages
| File | Purpose |
|------|---------|
| `src/app/cash-receipts/page.tsx` | Receipt list |
| `src/app/cash-receipts/new/page.tsx` | Create receipt |
| `src/app/cash-receipts/[id]/page.tsx` | View receipt |
| `src/app/cash-payments/page.tsx` | Payment list |
| `src/app/cash-payments/new/page.tsx` | Create payment |
| `src/app/bank-accounts/page.tsx` | Bank account list |
| `src/app/bank-transactions/page.tsx` | Bank transaction list |
| `src/app/reports/cash-book/page.tsx` | Cash book |
| `src/app/reports/bank-book/page.tsx` | Bank book |

---

## Test Criteria

- [ ] Can create and post cash receipt
- [ ] Cash receipt creates correct journal entry
- [ ] Cannot post cash payment if insufficient balance
- [ ] Bank transactions update bank balance correctly
- [ ] Cash book shows correct opening/closing balances
- [ ] Bank book shows correct balances per account
- [ ] Can export reports to Excel

---

## Notes

- Consider number-to-words conversion for Vietnamese (đọc số tiền)
- Print templates should follow Vietnamese accounting standards
- Bank reference number should be unique per bank account

---

**Previous Phase:** [Phase 02 - Core Accounting](./phase-02-core-accounting.md)  
**Next Phase:** [Phase 04 - Accounts Receivable](./phase-04-accounts-receivable.md)
