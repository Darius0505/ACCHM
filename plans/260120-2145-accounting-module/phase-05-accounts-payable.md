# Phase 05: Accounts Payable (AP)

**Status:** ⬜ Pending  
**Dependencies:** Phase 04 (Accounts Receivable)  
**Estimated:** 2 sessions

---

## Objective

Implement kế toán phải trả - quản lý công nợ nhà cung cấp, hóa đơn mua hàng, và thanh toán.

---

## Requirements

### Functional
- [ ] Quản lý danh mục nhà cung cấp
- [ ] Nhập hóa đơn mua hàng (Purchase Invoice)
- [ ] Ghi nhận thanh toán NCC
- [ ] Phân bổ thanh toán theo hóa đơn  
- [ ] Báo cáo công nợ phải trả
- [ ] Báo cáo tuổi nợ phải trả
- [ ] Sổ chi tiết công nợ NCC

### Non-Functional
- [ ] Validation: Due date tracking
- [ ] Reminder: Payment due alerts
- [ ] Integration: Ready for e-invoice input

---

## API Endpoints

### Vendors

```typescript
// Vendor CRUD
POST   /api/vendors                    // Create vendor
GET    /api/vendors                    // List vendors
GET    /api/vendors/:id                // Get vendor
PUT    /api/vendors/:id                // Update vendor
DELETE /api/vendors/:id                // Soft delete

// Vendor Analytics
GET    /api/vendors/:id/balance        // Get AP balance
GET    /api/vendors/:id/invoices       // Get vendor invoices
GET    /api/vendors/:id/payments       // Get vendor payments
```

### Purchase Invoices

```typescript
// Invoice CRUD
POST   /api/purchase-invoices          // Create invoice
GET    /api/purchase-invoices          // List invoices
GET    /api/purchase-invoices/:id      // Get invoice
PUT    /api/purchase-invoices/:id      // Update draft
DELETE /api/purchase-invoices/:id      // Delete draft

// Invoice Actions
POST   /api/purchase-invoices/:id/post // Post invoice
POST   /api/purchase-invoices/:id/cancel // Cancel invoice
```

### Vendor Payments

```typescript
// Payment CRUD
POST   /api/vendor-payments            // Create payment
GET    /api/vendor-payments            // List payments
GET    /api/vendor-payments/:id        // Get payment
PUT    /api/vendor-payments/:id        // Update draft
POST   /api/vendor-payments/:id/post   // Post payment
```

### AP Reports

```typescript
// Reports
GET    /api/reports/ap-balance         // AP Balance by vendor
GET    /api/reports/ap-aging           // Aging report
GET    /api/reports/ap-detail          // Detailed AP ledger
GET    /api/reports/payment-schedule   // Payment due schedule
```

---

## UI Components

### 1. Vendor List

```
┌─────────────────────────────────────────────────────────────────┐
│ Nhà Cung Cấp                                  [+ Thêm NCC mới]  │
├─────────────────────────────────────────────────────────────────┤
│ 🔍 [Tìm theo tên, mã, MST...]              [Tất cả ▼] [Active ▼]│
├─────────────────────────────────────────────────────────────────┤
│ Mã      │ Tên NCC             │ MST          │ Công nợ     │ ⚙️ │
│─────────┼─────────────────────┼──────────────┼─────────────┼────│
│ NCC001  │ Công ty DEF         │ 0312345111   │  30,000,000 │ ⋮  │
│ NCC002  │ Công ty GHI         │ 0398765222   │  18,500,000 │ ⋮  │
│ NCC003  │ Nhà phân phối JKL   │ 0356789333   │  12,000,000 │ ⋮  │
├─────────────────────────────────────────────────────────────────┤
│ Tổng công nợ phải trả:                            60,500,000    │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Purchase Invoice Form

```
┌─────────────────────────────────────────────────────────────────┐
│ HÓA ĐƠN MUA HÀNG                              [Nháp] [Ghi sổ]  │
├─────────────────────────────────────────────────────────────────┤
│ Số HĐ mua: HDM-2026-00001       Ngày HĐ NCC: [2026-01-18]      │
│ Số HĐ NCC: [HĐ001234_____]      Ngày đến hạn: [2026-02-17]     │
│                                                                 │
│ Nhà cung cấp: [Công ty DEF________________] [🔍]               │
│ Địa chỉ:      456 Lê Lợi, Quận 1, TP.HCM                       │
│ MST:          0312345111                                        │
├─────────────────────────────────────────────────────────────────┤
│ Chi tiết hóa đơn:                                              │
│ ┌────┬─────────────────────┬──────┬─────────┬───────────┬─────┐│
│ │ #  │ Diễn giải           │ TK   │ SL      │ Đơn giá   │Thành││
│ ├────┼─────────────────────┼──────┼─────────┼───────────┼─────┤│
│ │ 1  │ Nguyên vật liệu A   │ 152  │ 100     │   500,000 │ 50M ││
│ │ 2  │ Vật tư tiêu hao B   │ 153  │  50     │   200,000 │ 10M ││
│ │ +  │ [Thêm dòng...]                                        ││
│ └────┴─────────────────────┴──────┴─────────┴───────────┴─────┘│
│                                                                 │
│                              Cộng tiền hàng:       60,000,000  │
│                              Thuế GTGT (10%):       6,000,000  │
│                              ─────────────────────────────────  │
│                              TỔNG CỘNG:            66,000,000  │
├─────────────────────────────────────────────────────────────────┤
│ Đính kèm HĐ: [📎 Chọn file hóa đơn...]                         │
│                                                                 │
│                              [Hủy]  [Lưu nháp]  [Ghi sổ]       │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Vendor Payment Form

```
┌─────────────────────────────────────────────────────────────────┐
│ THANH TOÁN NHÀ CUNG CẤP                                        │
├─────────────────────────────────────────────────────────────────┤
│ Số chứng từ: TT-NCC-2026-00001    Ngày: [2026-01-28]           │
│                                                                 │
│ Nhà cung cấp: [Công ty DEF________________] [🔍]               │
│ Công nợ hiện tại: 66,000,000 VND                               │
│                                                                 │
│ Phương thức: [○ Tiền mặt  ◉ Chuyển khoản]                      │
│ Tài khoản NH: [Vietcombank 001234567890 ▼]                     │
│ Số tiền:      [    30,000,000 ] VND                            │
├─────────────────────────────────────────────────────────────────┤
│ Phân bổ vào hóa đơn:                                           │
│ ┌────┬───────────────┬────────────┬───────────┬───────────────┐│
│ │ ✓  │ Số HĐ NCC     │ Ngày HĐ    │ Còn nợ    │ Phân bổ       ││
│ ├────┼───────────────┼────────────┼───────────┼───────────────┤│
│ │ ☑  │ HĐ001234      │ 2026-01-10 │30,000,000 │ [30,000,000]  ││
│ │ ☐  │ HĐ001567      │ 2026-01-18 │36,000,000 │ [         0]  ││
│ └────┴───────────────┴────────────┴───────────┴───────────────┘│
│                                                                 │
│ Tổng phân bổ: 30,000,000 / 30,000,000 ✓                        │
├─────────────────────────────────────────────────────────────────┤
│                              [Hủy]  [Lưu nháp]  [Ghi sổ]       │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Payment Due Schedule

```
┌─────────────────────────────────────────────────────────────────┐
│ LỊCH THANH TOÁN SẮP ĐẾN HẠN                      [Export Excel]│
├─────────────────────────────────────────────────────────────────┤
│ Hiển thị: [30 ngày tới ▼]                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🔴 QUÁ HẠN (5 hóa đơn)                          Tổng: 25,000,000│
│ ├── HĐ001111 - NCC ABC      Quá hạn 10 ngày      10,000,000    │
│ ├── HĐ001222 - NCC DEF      Quá hạn 5 ngày       15,000,000    │
│                                                                 │
│ 🟡 ĐẾN HẠN TUẦN NÀY (3 hóa đơn)                 Tổng: 45,000,000│
│ ├── HĐ001333 - NCC GHI      Hạn: 25/01/2026      20,000,000    │
│ ├── HĐ001444 - NCC JKL      Hạn: 27/01/2026      25,000,000    │
│                                                                 │
│ 🟢 TRONG 30 NGÀY (8 hóa đơn)                    Tổng: 120,000,000│
│ ├── HĐ001555 - NCC MNO      Hạn: 05/02/2026      30,000,000    │
│ └── ...                                                         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ TỔNG CẦN THANH TOÁN:                               190,000,000  │
└─────────────────────────────────────────────────────────────────┘
```

### 5. AP Aging Report

```
┌─────────────────────────────────────────────────────────────────┐
│ BÁO CÁO TUỔI NỢ PHẢI TRẢ                         [Export Excel]│
├─────────────────────────────────────────────────────────────────┤
│ Tính đến ngày: [2026-01-31 ▼]                                  │
├─────────────────────────────────────────────────────────────────┤
│ NCC         │ Tổng nợ    │ Hiện tại │ 1-30 ngày│31-60 ngày│>60 │
│─────────────┼────────────┼──────────┼──────────┼──────────┼────│
│ Công ty DEF │ 66,000,000 │36,000,000│30,000,000│         0│   0│
│ Công ty GHI │ 18,500,000 │18,500,000│         0│         0│   0│
│ NP JKL      │ 12,000,000 │         0│ 7,000,000│ 5,000,000│   0│
├─────────────────────────────────────────────────────────────────┤
│ TỔNG CỘNG   │ 96,500,000 │54,500,000│37,000,000│ 5,000,000│   0│
│ Tỷ lệ %     │       100% │    56.5% │    38.3% │     5.2% │  0%│
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Backend

1. [ ] Extend Partner model for vendors
   - [ ] Vendor-specific fields
   - [ ] Payment terms

2. [ ] Create Purchase Invoice service
   - [ ] Create/Update/Delete/Post
   - [ ] Auto-calculate totals and tax
   - [ ] Auto-create journal entry
   - [ ] Update vendor balance

3. [ ] Create Vendor Payment service
   - [ ] Create/Update/Delete/Post
   - [ ] Payment allocation to invoices
   - [ ] Update invoice payment status
   - [ ] Create journal entry (Cash or Bank)

4. [ ] Create AP Report services
   - [ ] AP Balance report
   - [ ] Aging report
   - [ ] Payment due schedule
   - [ ] Vendor statement

5. [ ] Create API routes

### Frontend

6. [ ] Vendor management
   - [ ] List with search
   - [ ] Create/Edit form
   - [ ] Vendor detail page

7. [ ] Purchase Invoice pages
   - [ ] List page with filters
   - [ ] Create/Edit form
   - [ ] Account selection per line

8. [ ] Vendor Payment pages
   - [ ] List page
   - [ ] Create form with allocation grid
   - [ ] Multiple payment method support

9. [ ] AP Reports
   - [ ] Balance report page
   - [ ] Aging report page
   - [ ] Payment schedule (dashboard widget)
   - [ ] Excel export

---

## Files to Create/Modify

### API Routes
| File | Purpose |
|------|---------|
| `src/app/api/vendors/route.ts` | Vendor CRUD |
| `src/app/api/vendors/[id]/route.ts` | Single vendor |
| `src/app/api/purchase-invoices/route.ts` | Invoice CRUD |
| `src/app/api/purchase-invoices/[id]/route.ts` | Single invoice |
| `src/app/api/purchase-invoices/[id]/post/route.ts` | Post invoice |
| `src/app/api/vendor-payments/route.ts` | Payment CRUD |
| `src/app/api/reports/ap-aging/route.ts` | Aging report |
| `src/app/api/reports/ap-balance/route.ts` | Balance report |
| `src/app/api/reports/payment-schedule/route.ts` | Due schedule |

### Services
| File | Purpose |
|------|---------|
| `src/services/vendor.service.ts` | Vendor logic |
| `src/services/purchaseInvoice.service.ts` | Invoice logic |
| `src/services/vendorPayment.service.ts` | Payment logic |
| `src/services/apReport.service.ts` | AP reports |

### UI Pages
| File | Purpose |
|------|---------|
| `src/app/vendors/page.tsx` | Vendor list |
| `src/app/vendors/new/page.tsx` | Create vendor |
| `src/app/vendors/[id]/page.tsx` | Vendor detail |
| `src/app/purchase-invoices/page.tsx` | Invoice list |
| `src/app/purchase-invoices/new/page.tsx` | Create invoice |
| `src/app/purchase-invoices/[id]/page.tsx` | View invoice |
| `src/app/vendor-payments/page.tsx` | Payment list |
| `src/app/vendor-payments/new/page.tsx` | Create payment |
| `src/app/reports/ap-aging/page.tsx` | Aging report |
| `src/app/reports/payment-schedule/page.tsx` | Due schedule |

---

## Test Criteria

- [ ] Can create vendor with all required fields
- [ ] Can create purchase invoice with multiple lines
- [ ] Invoice calculates tax correctly
- [ ] Invoice creates correct journal entry when posted
- [ ] Vendor payment can be allocated to multiple invoices
- [ ] Invoice status updates to PAID when fully paid
- [ ] Aging report calculates correctly
- [ ] Payment schedule shows overdue items highlighted

---

## Notes

- Purchase invoice should capture vendor's invoice number
- Consider attachment support for scanned invoices
- Payment schedule could be a dashboard widget

---

**Previous Phase:** [Phase 04 - Accounts Receivable](./phase-04-accounts-receivable.md)  
**Next Phase:** [Phase 06 - Financial Reports](./phase-06-financial-reports.md)
