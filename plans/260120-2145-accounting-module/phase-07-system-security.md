# Phase 07: System & Security

**Status:** ⬜ Pending  
**Dependencies:** Phase 06 (Financial Reports)  
**Estimated:** 1 session

---

## Objective

Implement quản lý người dùng, phân quyền, và audit trail - nền tảng bảo mật cho hệ thống ERP.

---

## Requirements

### Functional
- [ ] Đăng nhập / Đăng xuất
- [ ] Quản lý người dùng
- [ ] Phân quyền theo role
- [ ] Phân quyền theo module/chức năng
- [ ] Audit log mọi thay đổi
- [ ] Multi-company access control
- [ ] Session management

### Non-Functional
- [ ] Security: Password hashing, JWT
- [ ] Performance: Optimized permission checks
- [ ] Compliance: Data privacy

---

## API Endpoints

### Authentication

```typescript
// Auth
POST   /api/auth/login                 // User login
POST   /api/auth/logout                // User logout
POST   /api/auth/refresh               // Refresh token
POST   /api/auth/forgot-password       // Request reset
POST   /api/auth/reset-password        // Reset password
GET    /api/auth/me                    // Get current user
```

### User Management

```typescript
// Users
POST   /api/users                      // Create user
GET    /api/users                      // List users
GET    /api/users/:id                  // Get user
PUT    /api/users/:id                  // Update user
DELETE /api/users/:id                  // Deactivate user
PUT    /api/users/:id/password         // Change password
PUT    /api/users/:id/roles            // Assign roles
```

### Role Management

```typescript
// Roles
POST   /api/roles                      // Create role
GET    /api/roles                      // List roles
GET    /api/roles/:id                  // Get role
PUT    /api/roles/:id                  // Update role
DELETE /api/roles/:id                  // Delete role
PUT    /api/roles/:id/permissions      // Set permissions
```

### Audit Log

```typescript
// Audit
GET    /api/audit-logs                 // List audit logs
       ?entity=Invoice
       ?action=CREATE
       ?userId=xxx
       ?fromDate=xxx
       ?toDate=xxx
GET    /api/audit-logs/:id             // Get audit detail
```

### Company Management

```typescript
// Companies (for multi-company)
POST   /api/companies                  // Create company
GET    /api/companies                  // List companies
GET    /api/companies/:id              // Get company
PUT    /api/companies/:id              // Update company
PUT    /api/companies/:id/settings     // Company settings
```

---

## Permission Matrix

### Roles

| Role | Description |
|------|-------------|
| **ADMIN** | Full system access |
| **ACCOUNTANT** | Full accounting access |
| **SENIOR_ACCOUNTANT** | Accounting + Approval |
| **MANAGER** | View reports + Approval |
| **VIEWER** | Read-only access |

### Permissions

| Module | View | Create | Edit | Delete | Post | Approve |
|--------|------|--------|------|--------|------|---------|
| Chart of Accounts | ✓ | ✓ | ✓ | ✓ | - | - |
| Journal Entries | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| Cash Receipts | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| Cash Payments | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Bank Transactions | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| Sales Invoices | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| Purchase Invoices | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| Customer Payments | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| Vendor Payments | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Customers | ✓ | ✓ | ✓ | ✓ | - | - |
| Vendors | ✓ | ✓ | ✓ | ✓ | - | - |
| Reports | ✓ | - | - | - | - | - |
| Users | ✓ | ✓ | ✓ | ✓ | - | - |
| Roles | ✓ | ✓ | ✓ | ✓ | - | - |
| Companies | ✓ | ✓ | ✓ | - | - | - |
| Audit Logs | ✓ | - | - | - | - | - |

---

## UI Components

### 1. Login Page

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        🏢 ACCHM ERP                             │
│                                                                 │
│              ┌─────────────────────────────────┐               │
│              │                                 │               │
│              │  Email                          │               │
│              │  [user@company.com___________]  │               │
│              │                                 │               │
│              │  Mật khẩu                       │               │
│              │  [••••••••••________________]  │               │
│              │                                 │               │
│              │  ☐ Ghi nhớ đăng nhập            │               │
│              │                                 │               │
│              │  [        Đăng nhập        ]   │               │
│              │                                 │               │
│              │  Quên mật khẩu?                 │               │
│              │                                 │               │
│              └─────────────────────────────────┘               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. User Management

```
┌─────────────────────────────────────────────────────────────────┐
│ Quản Lý Người Dùng                            [+ Thêm mới]     │
├─────────────────────────────────────────────────────────────────┤
│ 🔍 [Tìm kiếm...]                    [Tất cả ▼] [Hoạt động ▼]   │
├─────────────────────────────────────────────────────────────────┤
│ Tên           │ Email              │ Vai trò      │ TT    │ ⚙️ │
│───────────────┼────────────────────┼──────────────┼───────┼────│
│ Nguyễn Văn A  │ nva@company.com    │ Admin        │ 🟢    │ ⋮  │
│ Trần Thị B    │ ttb@company.com    │ Kế toán      │ 🟢    │ ⋮  │
│ Lê Văn C      │ lvc@company.com    │ Kế toán TP   │ 🟢    │ ⋮  │
│ Phạm Thị D    │ ptd@company.com    │ Xem báo cáo  │ 🔴    │ ⋮  │
├─────────────────────────────────────────────────────────────────┤
│ Hiển thị 1-4 của 4 người dùng                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3. User Form

```
┌─────────────────────────────────────────────────────────────────┐
│ Thông Tin Người Dùng                                           │
├─────────────────────────────────────────────────────────────────┤
│ Họ và tên:     [Nguyễn Văn A_______________________________]   │
│ Email:         [nva@company.com____________________________]   │
│ Điện thoại:    [0901234567_________________________________]   │
│                                                                 │
│ ─── Đăng nhập ───                                              │
│ Mật khẩu mới:  [________________________________] (để trống nếu│
│ Xác nhận MK:   [________________________________]  không đổi)  │
│                                                                 │
│ ─── Phân quyền ───                                             │
│ Vai trò:       [Kế toán viên ▼]                                │
│                                                                 │
│ Công ty truy cập:                                              │
│ ☑ Công ty ABC                                                  │
│ ☑ Công ty XYZ                                                  │
│ ☐ Chi nhánh HN                                                 │
│                                                                 │
│ Trạng thái:    [◉ Hoạt động  ○ Khóa]                          │
├─────────────────────────────────────────────────────────────────┤
│                              [Hủy]                 [Lưu]        │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Role Permissions

```
┌─────────────────────────────────────────────────────────────────┐
│ Phân Quyền: Kế Toán Viên                           [Lưu]       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ Kế toán tổng hợp ─────────────────────────────────────────┐ │
│ │ ☑ Hệ thống tài khoản    [☑Xem ☑Tạo ☑Sửa ☐Xóa]          │ │
│ │ ☑ Nhật ký chung         [☑Xem ☑Tạo ☑Sửa ☐Xóa ☑Ghi sổ]  │ │
│ │ ☑ Sổ cái               [☑Xem ☐Tạo ☐Sửa ☐Xóa]           │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─ Tiền mặt & Ngân hàng ─────────────────────────────────────┐ │
│ │ ☑ Phiếu thu             [☑Xem ☑Tạo ☑Sửa ☐Xóa ☑Ghi sổ]  │ │
│ │ ☑ Phiếu chi             [☑Xem ☑Tạo ☑Sửa ☐Xóa ☐Ghi sổ]  │ │
│ │ ☑ Giao dịch NH          [☑Xem ☑Tạo ☑Sửa ☐Xóa ☑Ghi sổ]  │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─ Phải thu (AR) ────────────────────────────────────────────┐ │
│ │ ☑ Khách hàng            [☑Xem ☑Tạo ☑Sửa ☐Xóa]           │ │
│ │ ☑ Hóa đơn bán           [☑Xem ☑Tạo ☑Sửa ☐Xóa ☑Ghi sổ]  │ │
│ │ ☑ Thu tiền KH           [☑Xem ☑Tạo ☑Sửa ☐Xóa ☑Ghi sổ]  │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─ Báo cáo ──────────────────────────────────────────────────┐ │
│ │ ☑ Báo cáo tài chính     [☑Xem ☐Tạo ☐Sửa ☐Xóa ☑Xuất]    │ │
│ │ ☑ Báo cáo công nợ       [☑Xem ☐Tạo ☐Sửa ☐Xóa ☑Xuất]    │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5. Audit Log

```
┌─────────────────────────────────────────────────────────────────┐
│ Nhật Ký Hoạt Động                                [Export]      │
├─────────────────────────────────────────────────────────────────┤
│ Người dùng: [Tất cả ▼]  Hành động: [Tất cả ▼]  Từ: [__] Đến: [__]│
│ Đối tượng:  [Tất cả ▼]                                [🔍 Lọc] │
├─────────────────────────────────────────────────────────────────┤
│ Thời gian        │ Người dùng │ Hành động │ Đối tượng    │ Chi tiết│
│──────────────────┼────────────┼───────────┼──────────────┼────────│
│ 20/01 15:30:45   │ nva@...    │ POST      │ JournalEntry │ 🔍     │
│ 20/01 15:28:12   │ nva@...    │ CREATE    │ JournalEntry │ 🔍     │
│ 20/01 14:15:00   │ ttb@...    │ UPDATE    │ Customer     │ 🔍     │
│ 20/01 10:00:00   │ lvc@...    │ LOGIN     │ User         │ 🔍     │
├─────────────────────────────────────────────────────────────────┤
│ [< 1 2 3 4 5 ... 100 >]                    Tổng: 2,450 bản ghi  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Backend

1. [ ] Authentication system
   - [ ] Password hashing (bcrypt)
   - [ ] JWT token generation/validation
   - [ ] Refresh token mechanism
   - [ ] Session management

2. [ ] User management
   - [ ] CRUD operations
   - [ ] Password change/reset
   - [ ] Email validation

3. [ ] Role & Permission system
   - [ ] Role CRUD
   - [ ] Permission definitions
   - [ ] Role-permission mapping
   - [ ] Permission checking middleware

4. [ ] Audit logging
   - [ ] Auto-log on data changes
   - [ ] Store old/new values
   - [ ] Query/filter audit logs

5. [ ] Multi-company access
   - [ ] Company-user mapping
   - [ ] Company-scoped data access
   - [ ] Context switching

### Frontend

6. [ ] Login/Logout pages
   - [ ] Login form
   - [ ] Forgot password flow
   - [ ] Session timeout handling

7. [ ] User management pages
   - [ ] User list
   - [ ] User form
   - [ ] Role assignment

8. [ ] Role management pages
   - [ ] Role list
   - [ ] Permission matrix editor

9. [ ] Audit log viewer
   - [ ] Filter & search
   - [ ] Detail view
   - [ ] Export

10. [ ] Company settings
    - [ ] Company profile
    - [ ] Accounting settings

---

## Files to Create/Modify

### API Routes
| File | Purpose |
|------|---------|
| `src/app/api/auth/login/route.ts` | Login |
| `src/app/api/auth/logout/route.ts` | Logout |
| `src/app/api/auth/me/route.ts` | Current user |
| `src/app/api/users/route.ts` | User CRUD |
| `src/app/api/users/[id]/route.ts` | Single user |
| `src/app/api/roles/route.ts` | Role CRUD |
| `src/app/api/roles/[id]/route.ts` | Single role |
| `src/app/api/audit-logs/route.ts` | Audit logs |
| `src/app/api/companies/route.ts` | Company CRUD |

### Services
| File | Purpose |
|------|---------|
| `src/services/auth.service.ts` | Auth logic |
| `src/services/user.service.ts` | User management |
| `src/services/role.service.ts` | Role management |
| `src/services/permission.service.ts` | Permission checks |
| `src/services/audit.service.ts` | Audit logging |

### Middleware
| File | Purpose |
|------|---------|
| `src/middleware/auth.ts` | Auth verification |
| `src/middleware/permission.ts` | Permission check |

### UI Pages
| File | Purpose |
|------|---------|
| `src/app/login/page.tsx` | Login page |
| `src/app/users/page.tsx` | User list |
| `src/app/users/new/page.tsx` | Create user |
| `src/app/users/[id]/page.tsx` | Edit user |
| `src/app/roles/page.tsx` | Role list |
| `src/app/roles/[id]/page.tsx` | Edit role |
| `src/app/audit-logs/page.tsx` | Audit log |
| `src/app/settings/company/page.tsx` | Company settings |

---

## Test Criteria

- [ ] User can login with correct credentials
- [ ] Invalid login shows error
- [ ] Token expires after configured time
- [ ] Refresh token works correctly
- [ ] Permission denied for unauthorized actions
- [ ] All data changes are logged
- [ ] Audit log captures old/new values
- [ ] Multi-company filtering works

---

## Notes

- Consider using NextAuth.js for easier auth setup
- Store sensitive data (passwords) securely
- Implement rate limiting for login attempts
- Session timeout should be configurable

---

**Previous Phase:** [Phase 06 - Financial Reports](./phase-06-financial-reports.md)  
**Next Phase:** [Phase 08 - Testing & Polish](./phase-08-testing.md)
