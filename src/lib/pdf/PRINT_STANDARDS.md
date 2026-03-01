# QUY CHUẨN THIẾT KẾ BẢN IN (PDF PRINT STANDARDS)

Tài liệu này quy định các tiêu chuẩn thiết kế UI/UX dành cho tất cả các bản in (Phiếu thu, Phiếu chi, Hóa đơn, Báo cáo...) được xuất ra file PDF trong hệ thống ACCHM ERP. Các tiêu chuẩn này được xây dựng dựa trên form mẫu kế toán truyền thống (Thông tư 200) kết hợp với thiết kế hiện đại, tinh gọn.

## 1. Hệ Thống Lưới & Trang (Page Layout)
- **Khổ giấy mặc định:** A4 (210 x 297 mm).
- **Lề trang (Margins):**
  - Mẫu 1 Liên (A4): `Top/Bottom 15mm`, `Left/Right 20mm`.
  - Mẫu 2 Liên (A4 chia đôi): `10mm 20mm` (tối ưu không gian để nhét vừa 2 bill trên 1 trang).
- **Phông chữ mặc định (Font Family):** `Roboto` (Hỗ trợ đầy đủ Tiếng Việt UTF-8).
- **Màu sắc cơ bản:**
  - Chữ thông thường: Đen tuyền `#000000`
  - Chữ ghi chú/nhạt: Xám đậm `#333333` hoặc `#555555`
  - Đường viền (Borders): Xám đen `#333333`
  - Đường cắt (Cut lines): `1pt dashed #999999`

---

## 2. Header (Thông tin Công ty & Mã Mẫu)
Phần đầu bảng in luôn chia làm 2 cột:

### 2.1 Cột Trái (Thông tin Công ty) - Chiếm 55-60% chiều rộng
- **Logo:** Kích thước tối đa `26x26 pt` (`object-fit: contain`), nằm bên trái cụm text.
- **Tên Công ty:**
  - Kích thước: `10pt`
  - Phông chữ: **In đậm (Bold)**, IN HOA (Uppercase)
- **Địa chỉ:**
  - Kích thước: `8pt`
  - Phông chữ: Thường (Regular), màu `#333333`
  - Khoảng cách (Margin-top): `2pt`

### 2.2 Cột Phải (Chỉ chứa QR Code) - Chiếm 40% chiều rộng, canh phải
- **QR Code (Tùy chọn):**
  - Kích thước: `40x40 pt`
  - Vị trí: Đặt bên trái cụm text Mã Biểu Mẫu (nếu cùng dòng) hoặc nằm hẳn một góc sát lề phải.
  - Chức năng: Chứa mã tra cứu nhanh chứng từ (ID, số tiền, ngày).

---

## 3. Tiêu đề Bảng in (Document Title)
Khu vực trung tâm (Center-aligned) thể hiện tên và thông tin chính của chứng từ:

- **Tên Chứng Từ (PHIẾU THU, PHIẾU CHI):**
  - Kích thước: `18pt` (Rất to, rõ ràng)
  - Phông chữ: **In đậm (Bold)**, IN HOA (Uppercase)
  - Margin bottom: `3pt`
- **Ngày tháng (Ngày... tháng... năm...):**
  - Kích thước: `9pt`
  - Phông chữ: *In nghiêng (Italic)*
- **Số chứng từ (Số: PT-0001):**
  - Kích thước: `9pt`
  - Chữ "Số:" in thường, giá trị mã số **In đậm (Bold)**
  - Margin top: `2pt`

---

## 4. Khu vực Nội dung (Body/Master Data)
Các trường thông tin dạng Label - Value (VD: Họ tên người nộp, Địa chỉ...):

- **Label (Tiêu đề trường - Cột trái):**
  - Kích thước: `10pt`
  - Chiều rộng cố định: `150pt` (để các nhãn thẳng hàng dọc)
  - Căn lề: Trái
- **Value (Giá trị nhập - Cột phải):**
  - Kích thước: `10pt`
  - Phông chữ: Thường (Regular) hoặc **In đậm (Bold)** đối với tên đối tác, số tiền.
  - Border: Dòng kẻ chấm (Dotted underline) bên dưới `0.5pt object #999` giúp mô phỏng form giấy in sẵn.
- Giá trị tiền bằng chữ: `10pt`, *In nghiêng (Italic)*.

---

## 5. Lưới Dữ Liệu (Data Grid / Table)
Bảng hạch toán hoặc danh sách hàng hóa:

- **Đường viền bảng (Borders):** Độ dày mỏng `0.5pt`, màu `#333333` (đều, sắc nét).
- **Dòng Tiêu đề (Header Row):**
  - Nền (Background): Xám nhạt `#f5f5f5`
  - Chữ: `9pt`, **In đậm (Bold)**
  - Căn lề: Căn giữa (Center-aligned) cho tất cả các cột
  - Padding: `4pt` top/bottom
- **Dòng Nội dung (Data Rows):**
  - Nền: Trắng
  - Chữ: `9pt`, Thường (Regular)
  - Căn lề: 
    - Text/Diễn giải: Căn trái (Left)
    - Số tài khoản/Mã: Căn giữa (Center)
    - Tiền tệ/Số lượng: Căn phải (Right)
  - Padding: `3pt` top/bottom, `4pt` left/right
- **Dòng Tổng cộng (Total Row):**
  - Nền (Background): Xám cực nhạt `#fafafa`
  - Chữ: `9pt`, **In đậm (Bold)** ở cột Giá trị
  - Label "Cộng": **In đậm (Bold)**

---

## 6. Khu vực Chữ ký (Signatures)
Luôn đặt ở dưới cùng của báo cáo, dàn đều theo chiều ngang (Flex-row, space-between).

- **Khối Chữ ký (Signature Box):** Rộng khoảng `18% - 20%` tổng chiều ngang để trải đều 3-4 chữ ký. Căn giữa (Align center) bên trong khối.
- **Chức danh (VD: Kế toán trưởng):**
  - Kích thước: `9pt`
  - Phông chữ: **In đậm (Bold)**
  - Margin bottom: `2pt`
- **Ghi chú (VD: Ký, họ tên):**
  - Kích thước: `8pt`
  - Phông chữ: *In nghiêng (Italic)*, màu `#555555`
- **Khoảng trống để ký tên (Signature Space):**
  - Chiều cao (Height): `40pt` - `50pt`
- **Tên người ký (Được render tự động nếu có):**
  - Kích thước: `9pt`
  - Phông chữ: **In đậm (Bold)**

---

## 7. Các Lưu Ý Trình Bày (Best Practices)
1. **Dynamic Scaling:** Tránh hardcode font size quá to khiến bảng bị rớt dòng. Tiêu chuẩn 9pt-10pt cho A4 là hoàn hảo với mắt người nhìn trên bản in giấy.
2. **Column Widths:** Các cột trong Table nên dùng tỷ lệ phần trăm (VD: `40% - 15% - 15% - 30%`) thay vì pixel cố định, phòng trường hợp chuyển mẫu từ A4 dọc sang A4 ngang.
3. **Mẫu Đa Liên (Multi-copy Layouts):**
   - Khi in 2 liên trên A4 dọc, mỗi liên hoạt động như một khối độc lập chiều cao `50%`. 
   - Không được thay đổi font size, chỉ thu nhỏ Margin khối mẹ (VD: dùng `<VoucherReport2LienLayout>`).
   - Có dòng text ghi chú "Liên 1", "Liên 2" được canh thẳng hàng nằm ngay bên trái mã QR Code ở góc trên cùng bên phải. Text dùng font `9pt`, *In nghiêng*, màu `#666666`.
