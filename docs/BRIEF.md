# 💡 BRIEF: ERP System - Module Kế Toán

**Ngày tạo:** 2026-01-20  
**Tên dự án:** ACCHM ERP  
**Nền tảng hiện có:** Next.js + MS SQL Server

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT

Doanh nghiệp Việt Nam đang đối mặt với các vấn đề:

| Vấn đề | Chi tiết |
|--------|----------|
| **Phần mềm rời rạc** | Kế toán 1 phần mềm, bán hàng 1 phần mềm, kho 1 phần mềm → không đồng bộ |
| **UI/UX lỗi thời** | Các phần mềm VN hiện tại (MISA, Fast) có giao diện cũ, khó dùng |
| **Khó tích hợp** | API hạn chế, khó kết nối với hệ thống khác |
| **Chi phí cao** | SAP/Oracle quá đắt cho SME, MISA/Fast không flexible |
| **On-premise lỗi thời** | Nhiều phần mềm vẫn cài đặt local, khó cập nhật |

---

## 2. GIẢI PHÁP ĐỀ XUẤT

Xây dựng **ERP SaaS hiện đại** với các đặc điểm:

```
┌─────────────────────────────────────────────────────────────┐
│                      ACCHM ERP                              │
│        "ERP hiện đại cho doanh nghiệp Việt Nam"            │
│                                                             │
│  ✓ UI/UX đẹp như SaaS quốc tế (Notion, Linear style)       │
│  ✓ Modular: Mua module nào dùng module đó                   │
│  ✓ API-first: Dễ tích hợp với bất kỳ hệ thống nào          │
│  ✓ Cloud-native: Không cần cài đặt, dùng ngay              │
│  ✓ Giá SME-friendly + Enterprise scalable                   │
│  ✓ Tuân thủ VAS (TT200/TT133) + E-invoice VN               │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. ĐỐI TƯỢNG SỬ DỤNG

### Primary Users:
| Đối tượng | Mô tả |
|-----------|-------|
| 👩‍💼 **Kế toán viên** | Nhập liệu hàng ngày, xem báo cáo |
| 👨‍💼 **Kế toán trưởng** | Kiểm soát, ký duyệt, đóng sổ |
| 📊 **Giám đốc tài chính (CFO)** | Xem dashboard, ra quyết định |

### Secondary Users:
| Đối tượng | Mô tả |
|-----------|-------|
| 🏢 **Chủ doanh nghiệp** | Xem tổng quan tài chính |
| 👥 **Nhân viên các phòng ban** | Đề xuất chi, xem budget |

### Quy mô doanh nghiệp:
- **Startup/Micro:** 1-10 nhân viên
- **SME:** 10-200 nhân viên  
- **Enterprise:** 200+ nhân viên

### Ngành nghề:
- Tổng quát (Thương mại, Dịch vụ, Sản xuất, Xây dựng...)

---

## 4. NGHIÊN CỨU THỊ TRƯỜNG

### Thị trường ERP Việt Nam 2024-2025:
| Chỉ số | Giá trị |
|--------|---------|
| Quy mô 2024 | $49.4 triệu USD |
| Dự báo 2030 | $81.3 triệu USD |
| CAGR | 8.5%/năm |
| SME adoption growth | +18% (2024) |

### Đối thủ cạnh tranh:

| Phần mềm | Loại | Giá (VNĐ) | Điểm mạnh | Điểm yếu |
|----------|------|-----------|-----------|----------|
| MISA AMIS | Cloud | 2.9M-8M/năm | Auto nhập liệu, phổ biến | Phí yearly, UI cũ |
| MISA SME | Desktop | 4.6M-14M | Không phí yearly | Offline, khó scale |
| Fast Accounting | Desktop | 5.9M-12M | Mạnh giá thành | UI rất cũ |
| Fast Online | Cloud | 1.1M-5.4M/năm | Rẻ | Tính năng hạn chế |
| Bravo | Custom | Tùy quy mô | Tùy chỉnh sâu | Đắt, triển khai lâu |
| SAP B1 | Hybrid | $$$$ | Enterprise-grade | Quá đắt cho SME |
| NetSuite | Cloud | $$$$ | Toàn diện | Cần partner, đắt |
| Viindoo | Cloud | Free-vài triệu | Open source, ERP đầy đủ | Community nhỏ |

### Điểm khác biệt của ACCHM ERP:

| USP | Chi tiết |
|-----|----------|
| 🎨 **Modern UI/UX** | Giao diện đẹp như Notion/Linear, không phải style Windows XP |
| 🧩 **Modular Architecture** | Chỉ mua/dùng module cần thiết |
| 🔌 **API-first** | REST API đầy đủ, webhook, dễ integrate |
| ☁️ **Cloud-native** | Multi-tenant SaaS, auto-scale |
| 💰 **Transparent Pricing** | Giá rõ ràng, không phí ẩn |
| 🇻🇳 **VN Compliance** | VAS ready, e-invoice integration |

---

## 5. TÍNH NĂNG MODULE KẾ TOÁN

### 🚀 MVP (Phase 1) - Ưu tiên cao nhất:

#### 5.1 Hệ thống tài khoản (Chart of Accounts)
- [ ] Danh mục tài khoản theo TT200/TT133
- [ ] Tạo/sửa/xóa tài khoản
- [ ] Nhóm tài khoản, phân cấp
- [ ] Import/Export danh mục

#### 5.2 Nhật ký chung (General Journal)
- [ ] Tạo bút toán (Journal Entry)
- [ ] Bút toán điều chỉnh
- [ ] Template bút toán thường dùng
- [ ] Đính kèm chứng từ

#### 5.3 Sổ cái (General Ledger)
- [ ] Xem sổ cái theo tài khoản
- [ ] Lọc theo kỳ, đối tượng
- [ ] Số dư đầu kỳ, phát sinh, cuối kỳ
- [ ] Drill-down đến chứng từ gốc

#### 5.4 Quản lý tiền mặt (Cash Management)
- [ ] Phiếu thu tiền mặt
- [ ] Phiếu chi tiền mặt
- [ ] Sổ quỹ tiền mặt
- [ ] Báo cáo tồn quỹ

#### 5.5 Quản lý tiền gửi ngân hàng (Bank Management)
- [ ] Danh mục tài khoản ngân hàng
- [ ] Báo nợ / Báo có ngân hàng
- [ ] Sổ tiền gửi ngân hàng
- [ ] Báo cáo số dư NH

#### 5.6 Kế toán phải thu cơ bản (AR Basic)
- [ ] Danh mục khách hàng
- [ ] Hóa đơn bán hàng (Sales Invoice)
- [ ] Ghi nhận thu tiền khách hàng
- [ ] Phân bổ thanh toán theo hóa đơn
- [ ] Báo cáo công nợ phải thu

#### 5.7 Kế toán phải trả cơ bản (AP Basic)
- [ ] Danh mục nhà cung cấp
- [ ] Hóa đơn mua hàng (Purchase Invoice)
- [ ] Ghi nhận thanh toán NCC
- [ ] Phân bổ thanh toán theo hóa đơn
- [ ] Báo cáo công nợ phải trả

#### 5.8 Báo cáo tài chính cơ bản
- [ ] Bảng cân đối phát sinh
- [ ] Bảng cân đối kế toán (Balance Sheet)
- [ ] Báo cáo kết quả kinh doanh (P&L)
- [ ] Export Excel/PDF

#### 5.9 Hệ thống & Bảo mật
- [ ] Quản lý người dùng
- [ ] Phân quyền theo role
- [ ] Audit log
- [ ] Multi-company (cơ bản)

---

### 🎁 Phase 2 - Nâng cao:

#### 5.10 Quản lý Tài sản cố định
- [ ] Danh mục TSCĐ
- [ ] Tự động tính khấu hao
- [ ] Điều chuyển, thanh lý TSCĐ
- [ ] Báo cáo TSCĐ

#### 5.11 Đối chiếu ngân hàng nâng cao
- [ ] Import bank statement
- [ ] Auto-matching transactions
- [ ] Reconciliation report

#### 5.12 E-Invoice Integration
- [ ] Tích hợp VNPT Invoice
- [ ] Tích hợp Viettel Invoice
- [ ] Tích hợp MISA Invoice
- [ ] Tra cứu, xác thực hóa đơn

#### 5.13 OCR & AI
- [ ] Scan hóa đơn tự động nhập liệu
- [ ] AI suggestion cho bút toán

#### 5.14 Báo cáo nâng cao
- [ ] Báo cáo lưu chuyển tiền tệ (Cash Flow)
- [ ] Thuyết minh BCTC
- [ ] Báo cáo thuế (VAT, TNDN)
- [ ] Custom report builder

#### 5.15 Multi-currency
- [ ] Hỗ trợ đa tiền tệ
- [ ] Tự động cập nhật tỷ giá
- [ ] Xử lý chênh lệch tỷ giá

---

### 💭 Backlog (Phase 3+):

- [ ] Budget Management
- [ ] Cost Center / Profit Center
- [ ] Consolidation (hợp nhất BCTC)
- [ ] Mobile App
- [ ] Offline mode
- [ ] AI Financial Analysis

---

## 6. ROADMAP TỔNG THỂ ERP

```
2026 Q1-Q2    │ Phase 1: Module Kế Toán MVP
              │ ├── Chart of Accounts
              │ ├── Journal Entry & General Ledger
              │ ├── Cash & Bank Management
              │ ├── AR/AP Basic
              │ └── Basic Financial Reports
              │
2026 Q3       │ Phase 1.5: Kế Toán Nâng Cao
              │ ├── Fixed Assets
              │ ├── E-Invoice Integration
              │ └── Advanced Reports
              │
2026 Q4       │ Phase 2: Inventory + Purchasing
              │ ├── Stock Management
              │ ├── Purchase Orders
              │ └── Supplier Management
              │
2027 Q1       │ Phase 3: Sales
              │ ├── Sales Orders
              │ ├── Customer Management
              │ └── Pricing & Discounts
              │
2027 Q2-Q3    │ Phase 4: Manufacturing
              │ ├── BOM
              │ ├── Work Orders
              │ └── Cost Accounting
              │
2027 Q4       │ Phase 5: HRM
              │ ├── Employee Management
              │ ├── Payroll
              │ └── Leave Management
```

---

## 7. ƯỚC TÍNH SƠ BỘ

### Độ phức tạp: 🟡 **Trung bình - Cao**

| Yếu tố | Đánh giá |
|--------|----------|
| **Technical** | Cần architecture tốt cho multi-tenant, scalable |
| **Business Logic** | Kế toán VN có nhiều quy định đặc thù |
| **Integration** | E-invoice, bank API cần effort |
| **UI/UX** | Cần invest để đạt standard cao |

### Rủi ro chính:

| Rủi ro | Mức độ | Mitigation |
|--------|--------|------------|
| Cạnh tranh với MISA | 🔴 Cao | Focus vào UX + API + niche market |
| Quy định thuế thay đổi | 🟡 TB | Thiết kế flexible, config-driven |
| E-invoice integration | 🟡 TB | Chọn 1 provider trước, mở rộng sau |
| Niềm tin brand mới | 🔴 Cao | Pilot free, xây case study |

---

## 8. TECH STACK ĐỀ XUẤT

| Layer | Technology | Lý do |
|-------|------------|-------|
| **Frontend** | Next.js 14+ (App Router) | Đã có sẵn, SEO, SSR |
| **UI Components** | shadcn/ui + Tailwind | Modern, customizable |
| **Backend** | Next.js API Routes / Node.js | Full-stack JS |
| **Database** | MS SQL Server | Đã có sẵn, enterprise-ready |
| **ORM** | Prisma / Drizzle | Type-safe, modern |
| **Auth** | NextAuth.js / Clerk | Easy setup |
| **Hosting** | Vercel / Azure | Scale dễ |
| **File Storage** | Azure Blob / S3 | Cho attachments |

---

## 9. BƯỚC TIẾP THEO

```
┌─────────────────────────────────────────┐
│  ✅ Brainstorm hoàn tất!                │
│                                         │
│  → Chạy /plan để tạo thiết kế chi tiết  │
│    • Database Schema                    │
│    • API Design                         │
│    • Component Structure                │
│    • Task breakdown                     │
└─────────────────────────────────────────┘
```

---

*Document này được tạo bởi /brainstorm workflow*
