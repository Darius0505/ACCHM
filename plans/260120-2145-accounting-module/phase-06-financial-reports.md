# Phase 06: Financial Reports

**Status:** ⬜ Pending  
**Dependencies:** Phase 05 (Accounts Payable)  
**Estimated:** 2 sessions

---

## Objective

Implement báo cáo tài chính cơ bản theo chuẩn mực kế toán Việt Nam (VAS) - output quan trọng nhất của module kế toán.

---

## Requirements

### Functional
- [ ] Bảng cân đối phát sinh (Trial Balance)
- [ ] Bảng cân đối kế toán (Balance Sheet) - Mẫu B01-DN
- [ ] Báo cáo kết quả kinh doanh (Income Statement) - Mẫu B02-DN
- [ ] Sổ cái tổng hợp
- [ ] Sổ chi tiết tài khoản
- [ ] Export Excel/PDF
- [ ] So sánh kỳ trước

### Non-Functional
- [ ] Performance: Cache for large reports
- [ ] Accuracy: Double-check calculations
- [ ] Compliance: VAS format

---

## API Endpoints

### Financial Statements

```typescript
// Balance Sheet (Bảng CĐKT)
GET    /api/reports/balance-sheet
       ?asOfDate=2026-01-31
       ?compareWithPrevious=true

// Income Statement (Báo cáo KQKD)
GET    /api/reports/income-statement
       ?fromDate=2026-01-01
       ?toDate=2026-01-31
       ?compareWithPrevious=true

// Trial Balance (Bảng CĐPS)
GET    /api/reports/trial-balance
       ?asOfDate=2026-01-31
       ?level=1,2,3

// General Ledger Summary
GET    /api/reports/gl-summary
       ?fromDate=2026-01-01
       ?toDate=2026-01-31
       ?accountId=xxx

// Account Detail Ledger
GET    /api/reports/account-detail
       ?accountId=xxx
       ?fromDate=2026-01-01
       ?toDate=2026-01-31
```

### Export

```typescript
// Export reports
GET    /api/reports/balance-sheet/export?format=excel
GET    /api/reports/balance-sheet/export?format=pdf
GET    /api/reports/income-statement/export?format=excel
GET    /api/reports/income-statement/export?format=pdf
```

---

## Report Templates

### 1. Bảng Cân Đối Phát Sinh (Trial Balance)

```
┌─────────────────────────────────────────────────────────────────┐
│                   BẢNG CÂN ĐỐI PHÁT SINH                       │
│                   Từ ngày 01/01/2026 đến 31/01/2026            │
├─────────────────────────────────────────────────────────────────┤
│                  │      Số dư đầu kỳ     │   Phát sinh trong kỳ   │    Số dư cuối kỳ    │
│ TK  │ Tên TK     │   Nợ      │   Có      │   Nợ      │   Có      │   Nợ      │   Có    │
│─────┼────────────┼───────────┼───────────┼───────────┼───────────┼───────────┼─────────│
│ 111 │ Tiền mặt   │10,000,000 │         0 │25,000,000 │18,000,000 │17,000,000 │       0 │
│ 112 │ TGNH       │85,000,000 │         0 │80,000,000 │50,000,000 │115,000,000│       0 │
│ 131 │ Phải thu   │25,000,000 │         0 │45,000,000 │30,000,000 │40,000,000 │       0 │
│ ... │            │           │           │           │           │           │         │
│ 331 │ Phải trả   │         0 │30,000,000 │20,000,000 │35,000,000 │         0 │45,000,000│
│ 411 │ Vốn CSH    │         0 │90,000,000 │         0 │         0 │         0 │90,000,000│
│ 511 │ Doanh thu  │           │           │         0 │50,000,000 │         0 │50,000,000│
│ 642 │ Chi phí QL │           │           │12,000,000 │         0 │12,000,000 │       0 │
├─────┴────────────┼───────────┼───────────┼───────────┼───────────┼───────────┼─────────┤
│ TỔNG CỘNG        │120,000,000│120,000,000│182,000,000│183,000,000│184,000,000│185,000,000│
└──────────────────┴───────────┴───────────┴───────────┴───────────┴───────────┴─────────┘
```

### 2. Bảng Cân Đối Kế Toán (Balance Sheet - B01-DN)

```
┌─────────────────────────────────────────────────────────────────┐
│                    BẢNG CÂN ĐỐI KẾ TOÁN                        │
│               (Mẫu số B01-DN theo Thông tư 200)                │
│                     Tại ngày 31/01/2026                        │
│                                                    Đvt: VNĐ    │
├─────────────────────────────────────────────────────────────────┤
│ CHỈ TIÊU                          │ Mã số │ Kỳ này   │ Kỳ trước│
│───────────────────────────────────┼───────┼──────────┼─────────│
│ A. TÀI SẢN NGẮN HẠN               │  100  │                    │
│───────────────────────────────────┼───────┼──────────┼─────────│
│ I. Tiền và các khoản TĐ tiền      │  110  │132,000,000│95,000,000│
│   1. Tiền                         │  111  │132,000,000│95,000,000│
│   2. Các khoản TĐ tiền            │  112  │         0│        0│
│                                   │       │          │         │
│ II. Các khoản phải thu NH         │  130  │40,000,000│25,000,000│
│   1. Phải thu KH                  │  131  │40,000,000│25,000,000│
│   2. Trả trước người bán          │  132  │         0│        0│
│                                   │       │          │         │
│ III. Hàng tồn kho                 │  140  │         0│        0│
│                                   │       │          │         │
│ IV. TS ngắn hạn khác              │  150  │         0│        0│
│                                   │       │          │         │
│ B. TÀI SẢN DÀI HẠN                │  200  │         0│        0│
│───────────────────────────────────┼───────┼──────────┼─────────│
│                                   │       │          │         │
│ TỔNG CỘNG TÀI SẢN                 │  270  │172,000,000│120,000,000│
│═══════════════════════════════════╪═══════╪══════════╪═════════│
│ C. NỢ PHẢI TRẢ                    │  300  │45,000,000│30,000,000│
│───────────────────────────────────┼───────┼──────────┼─────────│
│ I. Nợ ngắn hạn                    │  310  │45,000,000│30,000,000│
│   1. Phải trả người bán           │  311  │45,000,000│30,000,000│
│   2. Người mua trả trước          │  312  │         0│        0│
│                                   │       │          │         │
│ II. Nợ dài hạn                    │  330  │         0│        0│
│                                   │       │          │         │
│ D. VỐN CHỦ SỞ HỮU                 │  400  │127,000,000│90,000,000│
│───────────────────────────────────┼───────┼──────────┼─────────│
│ I. Vốn chủ sở hữu                 │  410  │127,000,000│90,000,000│
│   1. Vốn góp của CSH              │  411  │90,000,000│90,000,000│
│   2. Lợi nhuận sau thuế           │  421  │37,000,000│        0│
│                                   │       │          │         │
│ TỔNG CỘNG NGUỒN VỐN               │  440  │172,000,000│120,000,000│
└───────────────────────────────────┴───────┴──────────┴─────────┘
```

### 3. Báo Cáo Kết Quả Kinh Doanh (Income Statement - B02-DN)

```
┌─────────────────────────────────────────────────────────────────┐
│               BÁO CÁO KẾT QUẢ HOẠT ĐỘNG KINH DOANH             │
│               (Mẫu số B02-DN theo Thông tư 200)                │
│               Từ ngày 01/01/2026 đến 31/01/2026                │
│                                                    Đvt: VNĐ    │
├─────────────────────────────────────────────────────────────────┤
│ CHỈ TIÊU                          │ Mã số │ Kỳ này   │ Kỳ trước│
│───────────────────────────────────┼───────┼──────────┼─────────│
│ 1. Doanh thu bán hàng & CCDV      │   01  │66,000,000│        0│
│ 2. Các khoản giảm trừ DT          │   02  │   500,000│        0│
│ 3. Doanh thu thuần (01-02)        │   10  │65,500,000│        0│
│                                   │       │          │         │
│ 4. Giá vốn hàng bán               │   11  │15,000,000│        0│
│                                   │       │          │         │
│ 5. Lợi nhuận gộp (10-11)          │   20  │50,500,000│        0│
│                                   │       │          │         │
│ 6. Doanh thu hoạt động TC         │   21  │   500,000│        0│
│ 7. Chi phí tài chính              │   22  │         0│        0│
│   - Trong đó: Chi phí lãi vay     │   23  │         0│        0│
│                                   │       │          │         │
│ 8. Chi phí bán hàng               │   25  │ 3,000,000│        0│
│ 9. Chi phí quản lý DN             │   26  │10,000,000│        0│
│                                   │       │          │         │
│ 10. LN thuần từ HĐKD              │   30  │38,000,000│        0│
│     (20+21-22-25-26)              │       │          │         │
│                                   │       │          │         │
│ 11. Thu nhập khác                 │   31  │         0│        0│
│ 12. Chi phí khác                  │   32  │         0│        0│
│ 13. LN khác (31-32)               │   40  │         0│        0│
│                                   │       │          │         │
│ 14. Tổng LN kế toán trước thuế    │   50  │38,000,000│        0│
│     (30+40)                       │       │          │         │
│                                   │       │          │         │
│ 15. Chi phí thuế TNDN hiện hành   │   51  │ 1,000,000│        0│
│ 16. Chi phí thuế TNDN hoãn lại    │   52  │         0│        0│
│                                   │       │          │         │
│ 17. LN sau thuế TNDN (50-51-52)   │   60  │37,000,000│        0│
└───────────────────────────────────┴───────┴──────────┴─────────┘
```

---

## Implementation Steps

### Backend

1. [ ] Create Report Configuration
   - [ ] Report line items mapping to accounts
   - [ ] Formula definitions
   - [ ] VAS code mapping

2. [ ] Create Trial Balance service
   - [ ] Opening balance calculation
   - [ ] Period movement calculation
   - [ ] Multi-level aggregation

3. [ ] Create Balance Sheet service
   - [ ] Asset accounts aggregation
   - [ ] Liability accounts aggregation
   - [ ] Equity accounts aggregation
   - [ ] Period comparison

4. [ ] Create Income Statement service
   - [ ] Revenue accounts aggregation
   - [ ] Expense accounts aggregation
   - [ ] Profit calculation
   - [ ] Period comparison

5. [ ] Create Export service
   - [ ] Excel export with formatting
   - [ ] PDF export with VAS template

6. [ ] Create API routes

### Frontend

7. [ ] Trial Balance page
   - [ ] Date selector
   - [ ] Level filter
   - [ ] Drill-down to details
   - [ ] Export buttons

8. [ ] Balance Sheet page
   - [ ] As-of date selector
   - [ ] Compare with previous period
   - [ ] Collapsible sections
   - [ ] Print/Export

9. [ ] Income Statement page
   - [ ] Date range selector
   - [ ] Compare with previous period
   - [ ] Print/Export

10. [ ] Report Dashboard
    - [ ] Quick access to all reports
    - [ ] Key metrics summary

---

## Files to Create/Modify

### API Routes
| File | Purpose |
|------|---------|
| `src/app/api/reports/trial-balance/route.ts` | Trial balance |
| `src/app/api/reports/balance-sheet/route.ts` | Balance sheet |
| `src/app/api/reports/income-statement/route.ts` | Income statement |
| `src/app/api/reports/[report]/export/route.ts` | Export handler |

### Services
| File | Purpose |
|------|---------|
| `src/services/reports/trialBalance.service.ts` | TB calculations |
| `src/services/reports/balanceSheet.service.ts` | BS calculations |
| `src/services/reports/incomeStatement.service.ts` | IS calculations |
| `src/services/reports/exportService.ts` | Export to Excel/PDF |

### Configuration
| File | Purpose |
|------|---------|
| `src/config/reports/balanceSheet.config.ts` | BS line mappings |
| `src/config/reports/incomeStatement.config.ts` | IS line mappings |
| `src/config/reports/vasMapping.ts` | VAS code mappings |

### UI Pages
| File | Purpose |
|------|---------|
| `src/app/reports/page.tsx` | Report dashboard |
| `src/app/reports/trial-balance/page.tsx` | Trial balance |
| `src/app/reports/balance-sheet/page.tsx` | Balance sheet |
| `src/app/reports/income-statement/page.tsx` | Income statement |

### Components
| File | Purpose |
|------|---------|
| `src/components/reports/ReportTable.tsx` | Generic report table |
| `src/components/reports/ReportHeader.tsx` | Report header |
| `src/components/reports/DateRangePicker.tsx` | Period selector |
| `src/components/reports/ExportButtons.tsx` | Export options |

---

## Test Criteria

- [ ] Trial Balance balances (Total Debit = Total Credit)
- [ ] Balance Sheet balances (Assets = Liabilities + Equity)
- [ ] Income Statement calculates profit correctly
- [ ] Period comparison shows correct differences
- [ ] Excel export maintains formatting
- [ ] PDF export follows VAS template
- [ ] Large dataset performance acceptable

---

## Notes

- Report configurations should be data-driven for flexibility
- Consider caching for performance on large datasets
- VAS templates may need updates when regulations change
- Multi-company support: filter by companyId

---

**Previous Phase:** [Phase 05 - Accounts Payable](./phase-05-accounts-payable.md)  
**Next Phase:** [Phase 07 - System & Security](./phase-07-system-security.md)
