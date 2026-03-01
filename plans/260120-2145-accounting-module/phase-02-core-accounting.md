# Phase 02: Core Accounting (Journal & General Ledger)

**Status:** ⬜ Pending  
**Dependencies:** Phase 01 (Database Schema)  
**Estimated:** 3 sessions

---

## Objective

Implement core accounting functionality: Nhật ký chung (General Journal) và Sổ cái (General Ledger) - nền tảng cho mọi phân hệ kế toán khác.

---

## Requirements

### Functional
- [ ] CRUD Journal Entries (Bút toán)
- [ ] Auto-balancing validation (Debit = Credit)
- [ ] Entry numbering (auto-increment per journal)
- [ ] Post/Unpost entries
- [ ] Cancel entries (with reversal)
- [ ] View General Ledger by account
- [ ] View Trial Balance
- [ ] Period closing

### Non-Functional
- [ ] Performance: Pagination for large datasets
- [ ] Validation: Prevent posting to closed periods
- [ ] Audit: Log all changes

---

## API Endpoints

### Journal Entries

```typescript
// Journal Entry CRUD
POST   /api/journal-entries              // Create new entry
GET    /api/journal-entries              // List entries (with filters)
GET    /api/journal-entries/:id          // Get single entry
PUT    /api/journal-entries/:id          // Update draft entry
DELETE /api/journal-entries/:id          // Delete draft entry

// Entry Actions
POST   /api/journal-entries/:id/post     // Post entry
POST   /api/journal-entries/:id/cancel   // Cancel posted entry

// Templates
GET    /api/journal-entry-templates      // List templates
POST   /api/journal-entry-templates      // Create template
```

### General Ledger

```typescript
// General Ledger
GET    /api/general-ledger               // Get GL data
       ?accountId=xxx                    // Filter by account
       ?startDate=2026-01-01             // Period filter
       ?endDate=2026-01-31
       
// Trial Balance
GET    /api/trial-balance                // Get trial balance
       ?asOfDate=2026-01-31              // As of date
       ?level=1                          // Account level
       
// Account Balance
GET    /api/accounts/:id/balance         // Get account balance
GET    /api/accounts/:id/movements       // Get account movements
```

### Fiscal Period

```typescript
// Period Management
GET    /api/fiscal-periods               // List periods
POST   /api/fiscal-periods/:id/close     // Close period
POST   /api/fiscal-periods/:id/reopen    // Reopen period
```

---

## UI Components

### 1. Journal Entry Form

```
┌─────────────────────────────────────────────────────────────────┐
│ Journal Entry                                    [Draft] [Post] │
├─────────────────────────────────────────────────────────────────┤
│ Journal: [General Journal ▼]    Entry No: GJ-2026-00001         │
│ Date: [2026-01-20]              Posting Date: [2026-01-20]      │
│ Reference: [_______________]    Description: [______________]   │
├─────────────────────────────────────────────────────────────────┤
│ Lines:                                                          │
│ ┌────┬──────────┬─────────────────────┬───────────┬───────────┐ │
│ │ #  │ Account  │ Description         │ Debit     │ Credit    │ │
│ ├────┼──────────┼─────────────────────┼───────────┼───────────┤ │
│ │ 1  │ 111-Cash │ Cash received       │ 1,000,000 │           │ │
│ │ 2  │ 511-Rev  │ Sales revenue       │           │ 1,000,000 │ │
│ │ +  │ [Add line...]                                          │ │
│ └────┴──────────┴─────────────────────┴───────────┴───────────┘ │
│                                                                 │
│                           Total:       1,000,000    1,000,000   │
│                           Difference:               0 ✓        │
├─────────────────────────────────────────────────────────────────┤
│ Attachments: [📎 Add files...]                                  │
│                                                                 │
│                              [Cancel]  [Save Draft]  [Post]     │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Journal Entry List

```
┌─────────────────────────────────────────────────────────────────┐
│ Journal Entries                                [+ New Entry]    │
├─────────────────────────────────────────────────────────────────┤
│ 🔍 [Search...]  Journal: [All ▼]  Status: [All ▼]  Period: [▼] │
├─────────────────────────────────────────────────────────────────┤
│ Entry No      │ Date       │ Description      │ Amount    │ St │
│───────────────┼────────────┼──────────────────┼───────────┼────│
│ GJ-2026-00003 │ 2026-01-20 │ Monthly salary   │ 50,000,000│ ✓  │
│ GJ-2026-00002 │ 2026-01-19 │ Office supplies  │  2,500,000│ ✓  │
│ GJ-2026-00001 │ 2026-01-18 │ Opening balance  │100,000,000│ ✓  │
├─────────────────────────────────────────────────────────────────┤
│ Showing 1-10 of 156                           [< 1 2 3 ... >]   │
└─────────────────────────────────────────────────────────────────┘
```

### 3. General Ledger View

```
┌─────────────────────────────────────────────────────────────────┐
│ General Ledger                                                  │
├─────────────────────────────────────────────────────────────────┤
│ Account: [111 - Tiền mặt ▼]     Period: [01/2026 - 01/2026 ▼]  │
├─────────────────────────────────────────────────────────────────┤
│ Opening Balance:                              Debit: 10,000,000 │
├─────────────────────────────────────────────────────────────────┤
│ Date       │ Entry No      │ Description    │ Debit    │ Credit │
│────────────┼───────────────┼────────────────┼──────────┼────────│
│ 2026-01-02 │ CR-2026-00001 │ Customer pay   │5,000,000 │        │
│ 2026-01-05 │ CP-2026-00001 │ Office expense │          │ 500,000│
│ 2026-01-10 │ CR-2026-00002 │ Sales cash     │2,000,000 │        │
├─────────────────────────────────────────────────────────────────┤
│ Period Movement:                    7,000,000        500,000    │
│ Closing Balance:                              Debit: 16,500,000 │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Trial Balance

```
┌─────────────────────────────────────────────────────────────────┐
│ Trial Balance                                    [Export Excel] │
├─────────────────────────────────────────────────────────────────┤
│ As of: [2026-01-31 ▼]    Level: [All ▼]                        │
├─────────────────────────────────────────────────────────────────┤
│ Account          │ Name                  │ Debit      │ Credit  │
│──────────────────┼───────────────────────┼────────────┼─────────│
│ 111              │ Tiền mặt              │ 16,500,000 │         │
│ 112              │ Tiền gửi ngân hàng    │ 85,000,000 │         │
│ 131              │ Phải thu khách hàng   │ 25,000,000 │         │
│ ...              │                       │            │         │
│ 331              │ Phải trả người bán    │            │30,000,000│
│ 411              │ Vốn chủ sở hữu        │            │96,500,000│
├─────────────────────────────────────────────────────────────────┤
│                               TOTAL:      126,500,000 126,500,000│
│                               Difference:               0 ✓     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Backend

1. [ ] Create Journal Entry service
   - [ ] `createJournalEntry(data)`
   - [ ] `updateJournalEntry(id, data)`
   - [ ] `deleteJournalEntry(id)`
   - [ ] `postJournalEntry(id)`
   - [ ] `cancelJournalEntry(id)`
   
2. [ ] Create validation helpers
   - [ ] `validateBalanced(lines)` - Check debit = credit
   - [ ] `validatePeriod(date)` - Check period is open
   - [ ] `validateAccounts(lines)` - Check accounts exist & are posting
   
3. [ ] Create General Ledger service
   - [ ] `getGeneralLedger(accountId, startDate, endDate)`
   - [ ] `getTrialBalance(asOfDate, level)`
   - [ ] `getAccountBalance(accountId, asOfDate)`
   
4. [ ] Create number sequence service
   - [ ] `getNextNumber(journalCode, year)`
   
5. [ ] Create API routes
   - [ ] `/api/journal-entries/*`
   - [ ] `/api/general-ledger`
   - [ ] `/api/trial-balance`

### Frontend

6. [ ] Create Journal Entry List page
   - [ ] `/journal-entries` route
   - [ ] Filter & search
   - [ ] Pagination
   
7. [ ] Create Journal Entry Form
   - [ ] `/journal-entries/new`
   - [ ] `/journal-entries/[id]/edit`
   - [ ] Line items component
   - [ ] Account selector (searchable)
   
8. [ ] Create General Ledger page
   - [ ] `/general-ledger`
   - [ ] Account filter
   - [ ] Date range filter
   
9. [ ] Create Trial Balance page
   - [ ] `/trial-balance`
   - [ ] Export to Excel

---

## Files to Create/Modify

### API Routes
| File | Purpose |
|------|---------|
| `src/app/api/journal-entries/route.ts` | List & Create entries |
| `src/app/api/journal-entries/[id]/route.ts` | Get, Update, Delete |
| `src/app/api/journal-entries/[id]/post/route.ts` | Post entry |
| `src/app/api/journal-entries/[id]/cancel/route.ts` | Cancel entry |
| `src/app/api/general-ledger/route.ts` | Get GL data |
| `src/app/api/trial-balance/route.ts` | Get trial balance |

### Services
| File | Purpose |
|------|---------|
| `src/services/journalEntry.service.ts` | Journal entry logic |
| `src/services/generalLedger.service.ts` | GL calculations |
| `src/services/numberSequence.service.ts` | Auto numbering |

### UI Pages
| File | Purpose |
|------|---------|
| `src/app/journal-entries/page.tsx` | Entry list |
| `src/app/journal-entries/new/page.tsx` | Create entry |
| `src/app/journal-entries/[id]/page.tsx` | View entry |
| `src/app/journal-entries/[id]/edit/page.tsx` | Edit entry |
| `src/app/general-ledger/page.tsx` | GL view |
| `src/app/trial-balance/page.tsx` | Trial balance |

### Components
| File | Purpose |
|------|---------|
| `src/components/journal/EntryForm.tsx` | Entry form |
| `src/components/journal/EntryLines.tsx` | Line items |
| `src/components/journal/AccountSelect.tsx` | Account picker |
| `src/components/reports/TrialBalance.tsx` | TB display |

---

## Test Criteria

- [ ] Can create journal entry with multiple lines
- [ ] Entry must balance (debit = credit)
- [ ] Can post entry
- [ ] Posted entry cannot be edited
- [ ] Can cancel posted entry (creates reversal)
- [ ] General Ledger shows correct balances
- [ ] Trial Balance balances (total debit = total credit)
- [ ] Cannot post to closed period

---

## Notes

- Consider using optimistic locking for concurrent edits
- Entry number format: `{JournalPrefix}-{Year}-{Sequence:5}`
- All amounts stored as Decimal(18,2) for precision

---

**Previous Phase:** [Phase 01 - Database](./phase-01-database.md)  
**Next Phase:** [Phase 03 - Cash & Bank](./phase-03-cash-bank.md)
