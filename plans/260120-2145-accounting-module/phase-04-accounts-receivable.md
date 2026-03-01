# Phase 04: Accounts Receivable (AR)

**Status:** ⬜ Pending  
**Dependencies:** Phase 03 (Cash & Bank)  
**Estimated:** 2 sessions

---

## Objective

Implement kế toán phải thu - quản lý công nợ khách hàng, hóa đơn bán hàng, và thu tiền.

---

## Requirements

### Functional
- [ ] Quản lý danh mục khách hàng
- [ ] Tạo hóa đơn bán hàng (Sales Invoice)
- [ ] Ghi nhận thu tiền khách hàng
- [ ] Phân bổ thanh toán theo hóa đơn
- [ ] Báo cáo công nợ phải thu
- [ ] Báo cáo tuổi nợ (Aging Report)
- [ ] Sổ chi tiết công nợ

### Non-Functional
- [ ] Performance: Quick customer search
- [ ] Validation: Credit limit check
- [ ] Auto-calculate: Balance, aging

---

## API Endpoints

### Customers

```typescript
// Customer CRUD
POST   /api/customers                  // Create customer
GET    /api/customers                  // List customers
GET    /api/customers/:id              // Get customer
PUT    /api/customers/:id              // Update customer
DELETE /api/customers/:id              // Soft delete

// Customer Analytics
GET    /api/customers/:id/balance      // Get AR balance
GET    /api/customers/:id/invoices     // Get customer invoices
GET    /api/customers/:id/payments     // Get customer payments
GET    /api/customers/:id/statement    // Get statement
```

### Sales Invoices

```typescript
// Invoice CRUD
POST   /api/sales-invoices             // Create invoice
GET    /api/sales-invoices             // List invoices
GET    /api/sales-invoices/:id         // Get invoice
PUT    /api/sales-invoices/:id         // Update draft
DELETE /api/sales-invoices/:id         // Delete draft

// Invoice Actions
POST   /api/sales-invoices/:id/post    // Post invoice
POST   /api/sales-invoices/:id/cancel  // Cancel invoice
GET    /api/sales-invoices/:id/print   // Print invoice
```

### Customer Payments

```typescript
// Payment CRUD
POST   /api/customer-payments          // Create payment
GET    /api/customer-payments          // List payments
GET    /api/customer-payments/:id      // Get payment
PUT    /api/customer-payments/:id      // Update draft
POST   /api/customer-payments/:id/post // Post payment
```

### AR Reports

```typescript
// Reports
GET    /api/reports/ar-balance         // AR Balance by customer
GET    /api/reports/ar-aging           // Aging report
GET    /api/reports/ar-detail          // Detailed AR ledger
GET    /api/reports/customer-statement // Customer statement
```

---

## UI Components

### 1. Customer List

```
┌─────────────────────────────────────────────────────────────────┐
│ Khách Hàng                                    [+ Thêm KH mới]   │
├─────────────────────────────────────────────────────────────────┤
│ 🔍 [Tìm theo tên, mã, MST...]              [Tất cả ▼] [Active ▼]│
├─────────────────────────────────────────────────────────────────┤
│ Mã      │ Tên khách hàng      │ MST          │ Công nợ     │ ⚙️ │
│─────────┼─────────────────────┼──────────────┼─────────────┼────│
│ KH001   │ Công ty ABC         │ 0312345678   │  25,000,000 │ ⋮  │
│ KH002   │ Công ty XYZ         │ 0398765432   │  15,500,000 │ ⋮  │
│ KH003   │ Cửa hàng 123        │ 0356789012   │   5,200,000 │ ⋮  │
├─────────────────────────────────────────────────────────────────┤
│ Tổng công nợ phải thu:                            45,700,000    │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Customer Form

```
┌─────────────────────────────────────────────────────────────────┐
│ Thông Tin Khách Hàng                                           │
├─────────────────────────────────────────────────────────────────┤
│ Mã KH: [KH001_______]         Loại: [◉ Khách hàng  ○ Cả hai]   │
│                                                                 │
│ Tên công ty: [Công ty TNHH ABC_____________________________]   │
│ Mã số thuế:  [0312345678_____]                                 │
│                                                                 │
│ Địa chỉ:     [123 Nguyễn Huệ, Quận 1, TP.HCM______________]   │
│ Điện thoại:  [028-12345678__]    Email: [abc@email.com____]   │
│ Người LH:    [Nguyễn Văn A___]                                 │
│                                                                 │
│ ─── Điều khoản thanh toán ───                                  │
│ Số ngày công nợ: [30] ngày                                     │
│ Hạn mức công nợ: [100,000,000] VND                             │
│                                                                 │
│ ─── Tài khoản mặc định ───                                     │
│ TK Phải thu: [131 - Phải thu khách hàng ▼]                     │
│ TK Doanh thu: [511 - Doanh thu bán hàng ▼]                     │
├─────────────────────────────────────────────────────────────────┤
│                              [Hủy]                 [Lưu]        │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Sales Invoice Form

```
┌─────────────────────────────────────────────────────────────────┐
│ HÓA ĐƠN BÁN HÀNG                              [Nháp] [Ghi sổ]  │
├─────────────────────────────────────────────────────────────────┤
│ Số HĐ: HD-2026-00001            Ngày HĐ: [2026-01-20]          │
│                                  Ngày đến hạn: [2026-02-19]     │
│                                                                 │
│ Khách hàng: [Công ty ABC________________] [🔍]                 │
│ Địa chỉ:    123 Nguyễn Huệ, Quận 1, TP.HCM                     │
│ MST:        0312345678                                          │
├─────────────────────────────────────────────────────────────────┤
│ Chi tiết hóa đơn:                                              │
│ ┌────┬─────────────────────┬─────────┬───────────┬───────────┐ │
│ │ #  │ Diễn giải           │ SL      │ Đơn giá   │ Thành tiền│ │
│ ├────┼─────────────────────┼─────────┼───────────┼───────────┤ │
│ │ 1  │ Dịch vụ tư vấn      │ 1       │10,000,000 │10,000,000 │ │
│ │ 2  │ Phí triển khai      │ 1       │ 5,000,000 │ 5,000,000 │ │
│ │ +  │ [Thêm dòng...]                                        │ │
│ └────┴─────────────────────┴─────────┴───────────┴───────────┘ │
│                                                                 │
│                              Cộng tiền hàng:       15,000,000  │
│                              Thuế GTGT (10%):       1,500,000  │
│                              ─────────────────────────────────  │
│                              TỔNG CỘNG:            16,500,000  │
├─────────────────────────────────────────────────────────────────┤
│ Ghi chú: [________________________________________________]    │
│                                                                 │
│                              [Hủy]  [Lưu nháp]  [Ghi sổ]       │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Customer Payment Form

```
┌─────────────────────────────────────────────────────────────────┐
│ THU TIỀN KHÁCH HÀNG                                            │
├─────────────────────────────────────────────────────────────────┤
│ Số chứng từ: TT-2026-00001        Ngày: [2026-01-25]           │
│                                                                 │
│ Khách hàng: [Công ty ABC________________] [🔍]                 │
│ Công nợ hiện tại: 45,000,000 VND                               │
│                                                                 │
│ Phương thức: [◉ Tiền mặt  ○ Chuyển khoản]                      │
│ Số tiền thu: [    20,000,000 ] VND                             │
├─────────────────────────────────────────────────────────────────┤
│ Phân bổ vào hóa đơn:                                           │
│ ┌────┬───────────────┬────────────┬───────────┬───────────────┐│
│ │ ✓  │ Số HĐ         │ Ngày HĐ    │ Còn nợ    │ Phân bổ       ││
│ ├────┼───────────────┼────────────┼───────────┼───────────────┤│
│ │ ☑  │ HD-2026-00001 │ 2026-01-10 │15,000,000 │ [15,000,000]  ││
│ │ ☑  │ HD-2026-00003 │ 2026-01-15 │20,000,000 │ [ 5,000,000]  ││
│ │ ☐  │ HD-2026-00005 │ 2026-01-20 │10,000,000 │ [         0]  ││
│ └────┴───────────────┴────────────┴───────────┴───────────────┘│
│                                                                 │
│ Tổng phân bổ: 20,000,000 / 20,000,000 ✓                        │
├─────────────────────────────────────────────────────────────────┤
│                              [Hủy]  [Lưu nháp]  [Ghi sổ]       │
└─────────────────────────────────────────────────────────────────┘
```

### 5. AR Aging Report

```
┌─────────────────────────────────────────────────────────────────┐
│ BÁO CÁO TUỔI NỢ PHẢI THU                         [Export Excel]│
├─────────────────────────────────────────────────────────────────┤
│ Tính đến ngày: [2026-01-31 ▼]                                  │
├─────────────────────────────────────────────────────────────────┤
│ Khách hàng  │ Tổng nợ    │ Hiện tại │ 1-30 ngày│31-60 ngày│>60 │
│─────────────┼────────────┼──────────┼──────────┼──────────┼────│
│ Công ty ABC │ 45,000,000 │25,000,000│15,000,000│ 5,000,000│   0│
│ Công ty XYZ │ 30,000,000 │10,000,000│10,000,000│         0│10M │
│ Cửa hàng 123│  5,200,000 │ 5,200,000│         0│         0│   0│
├─────────────────────────────────────────────────────────────────┤
│ TỔNG CỘNG   │ 80,200,000 │40,200,000│25,000,000│ 5,000,000│10M │
│ Tỷ lệ %     │       100% │    50.1% │    31.2% │     6.2% │12.5│
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Backend

1. [ ] Extend Partner model for customers
   - [ ] Customer-specific fields
   - [ ] Credit limit validation

2. [ ] Create Sales Invoice service
   - [ ] Create/Update/Delete/Post
   - [ ] Auto-calculate totals and tax
   - [ ] Auto-create journal entry
   - [ ] Update customer balance

3. [ ] Create Customer Payment service
   - [ ] Create/Update/Delete/Post
   - [ ] Payment allocation to invoices
   - [ ] Update invoice payment status
   - [ ] Create journal entry

4. [ ] Create AR Report services
   - [ ] AR Balance report
   - [ ] Aging report (with configurable buckets)
   - [ ] Customer statement
   - [ ] Detail ledger

5. [ ] Create API routes

### Frontend

6. [ ] Customer management
   - [ ] List with search
   - [ ] Create/Edit form
   - [ ] Customer detail page (with balance, history)

7. [ ] Sales Invoice pages
   - [ ] List page with filters
   - [ ] Create/Edit form (with line items)
   - [ ] Invoice print preview

8. [ ] Customer Payment pages
   - [ ] List page
   - [ ] Create form with allocation grid

9. [ ] AR Reports
   - [ ] Balance report page
   - [ ] Aging report page
   - [ ] Customer statement page
   - [ ] Excel export

---

## Files to Create/Modify

### API Routes
| File | Purpose |
|------|---------|
| `src/app/api/customers/route.ts` | Customer CRUD |
| `src/app/api/customers/[id]/route.ts` | Single customer |
| `src/app/api/customers/[id]/balance/route.ts` | Customer balance |
| `src/app/api/sales-invoices/route.ts` | Invoice CRUD |
| `src/app/api/sales-invoices/[id]/route.ts` | Single invoice |
| `src/app/api/sales-invoices/[id]/post/route.ts` | Post invoice |
| `src/app/api/customer-payments/route.ts` | Payment CRUD |
| `src/app/api/reports/ar-aging/route.ts` | Aging report |
| `src/app/api/reports/ar-balance/route.ts` | Balance report |

### Services
| File | Purpose |
|------|---------|
| `src/services/customer.service.ts` | Customer logic |
| `src/services/salesInvoice.service.ts` | Invoice logic |
| `src/services/customerPayment.service.ts` | Payment logic |
| `src/services/arReport.service.ts` | AR reports |

### UI Pages
| File | Purpose |
|------|---------|
| `src/app/customers/page.tsx` | Customer list |
| `src/app/customers/new/page.tsx` | Create customer |
| `src/app/customers/[id]/page.tsx` | Customer detail |
| `src/app/sales-invoices/page.tsx` | Invoice list |
| `src/app/sales-invoices/new/page.tsx` | Create invoice |
| `src/app/sales-invoices/[id]/page.tsx` | View invoice |
| `src/app/customer-payments/page.tsx` | Payment list |
| `src/app/customer-payments/new/page.tsx` | Create payment |
| `src/app/reports/ar-aging/page.tsx` | Aging report |
| `src/app/reports/ar-balance/page.tsx` | Balance report |

---

## Test Criteria

- [ ] Can create customer with all required fields
- [ ] Can create sales invoice with multiple lines
- [ ] Invoice calculates tax correctly
- [ ] Invoice creates correct journal entry when posted
- [ ] Customer payment can be allocated to multiple invoices
- [ ] Invoice status updates to PAID when fully paid
- [ ] Aging report calculates correctly
- [ ] Credit limit warning shows when exceeded

---

## Notes

- Consider implementing credit hold functionality
- Payment allocation should prioritize oldest invoices (FIFO)
- Customer statement should be printable

---

**Previous Phase:** [Phase 03 - Cash & Bank](./phase-03-cash-bank.md)  
**Next Phase:** [Phase 05 - Accounts Payable](./phase-05-accounts-payable.md)
