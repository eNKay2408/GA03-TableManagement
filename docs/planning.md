# Requirement

### 1. Các tính năng bắt buộc (Feature Requirements)

Bạn cần triển khai 4 nhóm tính năng chính:

- **Table CRUD (3 điểm):**
    - Thực hiện đầy đủ: Thêm, Xem, Sửa, và Xóa (Soft Delete - chỉ đổi status, không xóa DB).
    - **Validation:** Số bàn (Table number) phải duy nhất, sức chứa (Capacity) là số dương (1-20).
    - **Logic:** Không được deactivate bàn nếu đang có đơn hàng (active orders).
- **QR Code Generation (3 điểm):**
    - Mỗi bàn một QR Code riêng biệt chứa URL kèm **signed token** (dùng JWT hoặc HMAC).
    - Token phải chứa: Table ID, Restaurant ID và Timestamp.
    - **Quan trọng:** Backend phải verify được token này khi scan.
- **Download & Print (2 điểm):**
    - Hỗ trợ tải QR dạng ảnh **PNG** và tài liệu **PDF** (có logo, hướng dẫn, số bàn).
    - Tính năng in ấn (Print Preview) và tải hàng loạt (Batch download - ZIP file).
- **QR Regeneration (1 điểm):**
    - Tạo token mới cho bàn và **vô hiệu hóa ngay lập tức** token cũ/QR cũ.
    - Khi scan QR cũ phải báo lỗi thân thiện cho user.

### 2. Yêu cầu kỹ thuật & Triển khai

- **Database:** Đã có gợi ý schema bảng `tables` (UUID, table_number, capacity, qr_token, status...).
- **Tech Stack gợi ý:**
    - *Backend:* `qrcode`, `jsonwebtoken`, `pdfkit` hoặc `puppeteer`.
    - *Frontend:* `react-qr-code`, `react-to-print`.
- **Deployment (1 điểm):** Phải deploy lên public hosting (có URL truy cập được).

### 3. Tổng kết điểm số

Tổng cộng là **10 điểm**, trong đó phần logic CRUD và QR Code chiếm trọng số cao nhất (60%).

# Planning

### 1. Phân vai (The Squad)

- **Intern A (Backend Lead - Cứng tay nhất):** Chuyên trị Database và CRUD API cơ bản.
- **Intern B (Frontend Lead):** Chuyên trị giao diện React, xử lý state và gọi API.
- **Intern C (QR Specialist):** Chuyên nghiên cứu lib `qrcode`, `pdfkit`, và logic JWT token. Bạn này sẽ làm backend phụ trợ cho A và feature PDF.

---

### 2. Lịch trình 3 Ngày (The Sprints)

### **Ngày 1: Core Foundation (Xây móng)**

Mục tiêu: Chạy được luồng thêm/sửa/xóa bàn cơ bản.

- **Intern A:**
    - Tạo bảng `tables` trong DB theo schema (lưu ý constraint `unique` cho table_number).
    - Viết 5 API CRUD cơ bản: `GET list`, `GET detail`, `POST create`, `PUT update`, `PATCH status` (Soft delete).
- **Intern B:**
    - Dựng khung UI trang Admin Table Management.
    - Tạo Modal/Form để "Create Table" và "Edit Table" (Validate số lượng > 0).
- **Intern C:**
    - Viết Utility Function (Backend): Input là `tableId` -> Output là JWT Token và Base64 QR Image.
    - Test riêng function này để đảm bảo QR quét ra đúng URL quy định.

### **Ngày 2: Integration & Hard Features (Ghép & Nâng cao)**

Mục tiêu: QR Code hiện lên UI và tính năng Download/Print hoạt động.

- **Intern A & C phối hợp:**
    - Tích hợp hàm tạo QR của C vào API `Create Table` của A (Khi tạo bàn -> tự động sinh QR token lưu xuống DB).
    - Làm API `Regenerate QR` (Update token mới, invalidate token cũ).
- **Intern C (Solo PDF):**
    - Viết API `Download PDF` dùng `pdfkit`: Vẽ template đơn giản (Số bàn + Hình QR + Logo).
- **Intern B:**
    - Ghép API của A vào giao diện.
    - Hiển thị list bàn kèm trạng thái và nút "View QR".
    - Làm nút "Print/Download" gọi API của C.

### **Ngày 3: Polish, Verify & Deploy (Về đích)**

Mục tiêu: Deploy lên public hosting và không bị crash.

- **Intern A:**
    - Viết API `/api/menu` để verify token khi user scan QR (Check token valid/invalid).
    - Setup Database trên Cloud (Supabase/Neon/etc).
- **Intern B:**
    - Test giao diện trên Mobile (Responsive check).
    - Xử lý loading state khi đang generate QR hoặc download PDF.
- **Intern C:**
    - Deploy Backend & Frontend (Render/Vercel).
    - Test luồng "Regenerate QR" -> Scan QR cũ xem có báo lỗi không?.