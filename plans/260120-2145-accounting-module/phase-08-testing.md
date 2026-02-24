# Phase 08: Testing & Polish

**Status:** ⬜ Pending  
**Dependencies:** All previous phases  
**Estimated:** 1 session

---

## Objective

Kiểm thử toàn diện, sửa lỗi, và polish UX trước khi release module kế toán MVP.

---

## Requirements

### Testing
- [ ] Unit tests cho business logic
- [ ] Integration tests cho API
- [ ] E2E tests cho critical flows
- [ ] Performance testing

### Polish
- [ ] UI/UX review & fixes
- [ ] Responsive design fixes
- [ ] Loading states & error handling
- [ ] i18n review
- [ ] Accessibility check

---

## Test Scenarios

### 1. Authentication & Authorization

| # | Scenario | Steps | Expected |
|---|----------|-------|----------|
| 1.1 | Login success | Enter valid email/password | Redirect to dashboard |
| 1.2 | Login fail | Enter wrong password | Show error message |
| 1.3 | Permission denied | Access restricted page | Show 403 page |
| 1.4 | Session timeout | Wait for token expire | Redirect to login |

### 2. Chart of Accounts

| # | Scenario | Steps | Expected |
|---|----------|-------|----------|
| 2.1 | Create account | Fill form, save | Account created |
| 2.2 | Edit account | Change name, save | Account updated |
| 2.3 | Delete account with balance | Try to delete | Show warning |
| 2.4 | Account hierarchy | Create child account | Parent shows children |

### 3. Journal Entries

| # | Scenario | Steps | Expected |
|---|----------|-------|----------|
| 3.1 | Create balanced entry | Add lines D=C | Entry created |
| 3.2 | Create unbalanced entry | Add lines D≠C | Validation error |
| 3.3 | Post entry | Click Post button | Status = Posted |
| 3.4 | Edit posted entry | Try to edit | Cannot edit |
| 3.5 | Cancel posted entry | Click Cancel | Reversal entry created |

### 4. Cash Management

| # | Scenario | Steps | Expected |
|---|----------|-------|----------|
| 4.1 | Cash receipt | Create & post | Cash balance increases |
| 4.2 | Cash payment - sufficient | Create & post | Cash balance decreases |
| 4.3 | Cash payment - insufficient | Amount > balance | Warning message |
| 4.4 | Cash book | View for period | Shows correct balance |

### 5. Bank Management

| # | Scenario | Steps | Expected |
|---|----------|-------|----------|
| 5.1 | Bank deposit | Create & post | Bank balance increases |
| 5.2 | Bank withdrawal | Create & post | Bank balance decreases |
| 5.3 | Bank book | Filter by account | Shows correct transactions |

### 6. Accounts Receivable

| # | Scenario | Steps | Expected |
|---|----------|-------|----------|
| 6.1 | Create customer | Fill form | Customer created |
| 6.2 | Create sales invoice | Add lines | Invoice created |
| 6.3 | Post invoice | Post button | AR balance increases |
| 6.4 | Partial payment | Pay less than total | Status = Partial |
| 6.5 | Full payment | Pay remaining | Status = Paid |
| 6.6 | AR aging | View report | Correct aging buckets |

### 7. Accounts Payable

| # | Scenario | Steps | Expected |
|---|----------|-------|----------|
| 7.1 | Create vendor | Fill form | Vendor created |
| 7.2 | Create purchase invoice | Add lines | Invoice created |
| 7.3 | Post invoice | Post button | AP balance increases |
| 7.4 | Vendor payment | Pay invoice | AP balance decreases |
| 7.5 | Payment schedule | View overdue | Correct highlighting |

### 8. Financial Reports

| # | Scenario | Steps | Expected |
|---|----------|-------|----------|
| 8.1 | Trial balance | Generate | Debit = Credit |
| 8.2 | Balance sheet | Generate | Assets = Liabilities + Equity |
| 8.3 | Income statement | Generate | Correct profit calculation |
| 8.4 | Period comparison | Compare with prev | Shows differences |
| 8.5 | Export Excel | Click export | Download Excel file |
| 8.6 | Export PDF | Click export | Download PDF file |

### 9. Multi-company

| # | Scenario | Steps | Expected |
|---|----------|-------|----------|
| 9.1 | Switch company | Select different company | Data changes |
| 9.2 | Company isolation | Create entry | Only in current company |
| 9.3 | Cross-company access | User with 2 companies | Can switch between |

### 10. Performance

| # | Scenario | Criteria | Expected |
|---|----------|----------|----------|
| 10.1 | Load account list | 1000 accounts | < 2 seconds |
| 10.2 | Load journal entries | 10000 entries | < 3 seconds (paginated) |
| 10.3 | Generate trial balance | 1000 accounts | < 5 seconds |
| 10.4 | Generate balance sheet | Full report | < 5 seconds |

---

## UI/UX Checklist

### Visual Design

- [ ] Consistent color scheme across all pages
- [ ] Proper spacing and alignment
- [ ] Typography hierarchy (headings, body, labels)
- [ ] Icons consistent and meaningful
- [ ] Empty states have helpful messages
- [ ] Error states are clear and actionable

### Responsive Design

- [ ] Desktop (1920px) - looks great
- [ ] Laptop (1366px) - works well
- [ ] Tablet (768px) - usable
- [ ] Mobile (375px) - basic functionality works

### Loading & Feedback

- [ ] Loading spinners for async operations
- [ ] Skeleton loaders for content
- [ ] Success toast messages
- [ ] Error toast messages with details
- [ ] Confirmation dialogs for destructive actions

### Forms

- [ ] Form validation on blur and submit
- [ ] Clear error messages per field
- [ ] Required field indicators
- [ ] Autocomplete where appropriate
- [ ] Keyboard navigation (Tab, Enter)

### Navigation

- [ ] Breadcrumbs on detail pages
- [ ] Active state on current menu item
- [ ] Back buttons where needed
- [ ] Consistent page titles

### Accessibility

- [ ] Proper heading structure (h1, h2, h3)
- [ ] Alt text on images
- [ ] Focus states visible
- [ ] Color contrast sufficient
- [ ] Screen reader friendly

---

## i18n Review

### Languages to verify

- [ ] Vietnamese (vi) - Primary
- [ ] English (en) - Secondary
- [ ] Japanese (ja) - Optional
- [ ] Korean (ko) - Optional

### Check per language

- [ ] All static text translated
- [ ] Date format correct (DD/MM/YYYY vs MM/DD/YYYY)
- [ ] Number format correct (1,000.00 vs 1.000,00)
- [ ] Currency format correct
- [ ] Reports in correct language
- [ ] Error messages translated

---

## Bug Tracking

| ID | Severity | Module | Description | Status |
|----|----------|--------|-------------|--------|
| | | | | |

### Severity levels
- 🔴 **Critical** - System unusable, data loss
- 🟠 **High** - Major feature broken
- 🟡 **Medium** - Minor feature broken
- 🟢 **Low** - Cosmetic issue

---

## Performance Optimization

### Database

- [ ] Add indexes for common queries
- [ ] Optimize N+1 queries
- [ ] Add pagination for large lists
- [ ] Review slow queries

### Frontend

- [ ] Lazy load pages
- [ ] Optimize images
- [ ] Minimize bundle size
- [ ] Add caching headers

### API

- [ ] Response compression
- [ ] Request batching where possible
- [ ] Cache frequently accessed data

---

## Pre-release Checklist

### Code Quality

- [ ] No console.log statements
- [ ] No commented-out code
- [ ] No hardcoded values
- [ ] Proper error handling
- [ ] TypeScript no errors

### Security

- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Secure headers
- [ ] Sensitive data not logged

### Documentation

- [ ] API documentation updated
- [ ] README updated
- [ ] Environment variables documented
- [ ] Deployment guide updated

### Deployment

- [ ] Environment variables set
- [ ] Database migrations ready
- [ ] Seed data prepared
- [ ] Backup strategy in place
- [ ] Rollback plan documented

---

## Implementation Steps

1. [ ] Write unit tests for services
2. [ ] Write integration tests for APIs
3. [ ] Run through manual test scenarios
4. [ ] Fix critical and high severity bugs
5. [ ] UI/UX review and fixes
6. [ ] i18n review
7. [ ] Performance optimization
8. [ ] Security review
9. [ ] Documentation update
10. [ ] Final QA pass

---

## Files to Create/Modify

### Tests
| File | Purpose |
|------|---------|
| `src/__tests__/services/*.test.ts` | Service unit tests |
| `src/__tests__/api/*.test.ts` | API integration tests |
| `cypress/e2e/*.cy.ts` | E2E tests |

### Config
| File | Purpose |
|------|---------|
| `jest.config.js` | Jest configuration |
| `cypress.config.ts` | Cypress configuration |

---

## Notes

- Prioritize critical flow testing
- Focus on data integrity for accounting
- Performance is important for large datasets
- Consider beta testing with real users

---

**Previous Phase:** [Phase 07 - System & Security](./phase-07-system-security.md)  
**🎉 MVP Complete after this phase!**
