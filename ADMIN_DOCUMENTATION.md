# TÀI LIỆU HỆ THỐNG QUẢN TRỊ (ADMIN PANEL) - CK_TMDT HANDMADE

> **Mục đích của tài liệu:** Cung cấp context (bối cảnh) đầy đủ và flow hoạt động chi tiết của phân hệ Admin trong dự án sàn thương mại điện tử Đồ Handmade. File này được thiết kế để các Agent AI đọc và hiểu được cấu trúc, logic nghiệp vụ, và những gì đã được triển khai trước đó nhằm tránh việc code sai nghiệp vụ hoặc phá vỡ cấu trúc có sẵn.

---

## 1. BỐI CẢNH DỰ ÁN (CONTEXT)
- **Domain:** Sàn thương mại điện tử chuyên bán các sản phẩm thủ công, đồ Handmade có tính năng cá nhân hóa (khắc chữ, custom theo yêu cầu).
- **Lịch sử UI:** Frontend của phân hệ Admin được tái sử dụng (copy) từ một dự án cũ về quản lý phòng khám thú cưng (Pet Shop). Tuy nhiên, **toàn bộ mã nguồn đã được dọn dẹp sạch sẽ và viết lại (refactor)** để loại bỏ hoàn toàn các khái niệm "Pet Shop" (như lịch khám, bác sĩ) và thay thế bằng các khái niệm "Handmade" (phí thiết kế, sản phẩm chờ duyệt).
- **Tech Stack:** 
  - **Backend:** Java Spring Boot.
  - **Frontend:** React, React Router, TailwindCSS, Lucide React (icon), Recharts (biểu đồ). Nằm trong thư mục `FrontEnd/seller-admin`.
  - **Cơ chế gọi API:** Gom chung trong file `src/api/sellerApi.ts`.

---

## 2. KIẾN TRÚC & PHÂN QUYỀN (ROUTING & LAYOUT)
- **Phân quyền Role-based:** Hệ thống Frontend phân quyền dựa trên field `role` của object `user` (`USER`, `SELLER`, `ADMIN`).
- **Layout & Điều hướng:** 
  - `App.tsx` kiểm tra role. Nếu là `ADMIN` sẽ route vào `/admin/dashboard`.
  - `SellerLayout.tsx` là component dùng chung cho cả Seller và Admin. Nếu là Admin, thanh Sidebar bên trái sẽ tự động render các menu dành riêng cho Admin (`ADMIN_NAV`) bao gồm: *Tổng quan, Duyệt sản phẩm, Đơn hàng, Người dùng, Đánh giá*.
  - **Logo Sidebar:** Đã được sửa thành chữ **"HandMade"** với icon cây búa (`Hammer`), đại diện cho đồ thủ công.

---

## 3. CHI TIẾT CÁC MODULE ADMIN & LUỒNG HOẠT ĐỘNG (FLOWS)

### 3.1. Dashboard Tổng Quan (`AdminDashboard.tsx`)
- **Nghiệp vụ:** Hiển thị các KPI và phân tích dữ liệu toàn hệ thống.
- **Dữ liệu hiển thị (từ `adminDashboardApi`):**
  - KPI Card: Doanh thu tháng này, Tổng đơn hàng, Tổng sản phẩm (kèm chú thích số SP chờ duyệt), Tổng Người dùng & Seller.
  - Biểu đồ: Doanh thu theo thời gian (LineChart), Trạng thái đơn hàng (PieChart).
  - Danh sách: Top sản phẩm bán chạy nhất, Các đơn hàng vừa được tạo (Real-time tracking).

### 3.2. Quản Lý Sản Phẩm - Duyệt Sản Phẩm (`AdminProducts.tsx`)
- **CỰC KỲ QUAN TRỌNG:** Admin **KHÔNG** có quyền Thêm, Sửa (edit nội dung), hay Sửa tồn kho sản phẩm. Các nghiệp vụ này là của Seller.
- **Nghiệp vụ của Admin:** Chỉ xem và **Duyệt (Approve)** hoặc **Từ chối (Reject)** các sản phẩm mới do Seller đẩy lên.
- **Flow:**
  1. Hiển thị bảng danh sách sản phẩm, có bộ lọc theo trạng thái (`PENDING_APPROVAL`, `ACTIVE`, `REJECTED`).
  2. Bấm "Chi tiết" để mở Modal xem thông tin sản phẩm (Tên, Ảnh, Giá, Danh mục, Lượng tồn kho, Mô tả).
  3. Nếu trạng thái là `PENDING_APPROVAL`, Modal sẽ hiện 2 nút: **Từ chối** và **Duyệt**.
  4. Gọi API `adminProductApi.approve(id)` hoặc `adminProductApi.reject(id)`.

### 3.3. Giám Sát Đơn Hàng (`AdminOrders.tsx`)
- **CỰC KỲ QUAN TRỌNG:** Màn hình này ở chế độ **Read-Only (Chỉ xem)**. Admin không có quyền cập nhật trạng thái đơn hàng (Ví dụ: không được chuyển từ Đang xử lý sang Đang giao). Trách nhiệm đó thuộc về Seller.
- **Nghiệp vụ:** Admin giám sát toàn bộ đơn hàng trên nền tảng.
- **Đặc điểm Handmade:** Modal chi tiết đơn hàng đã được thiết kế để render các trường Customization của khách hàng:
  - `customText` (Chữ khách muốn khắc/in).
  - `customNote` (Ghi chú chi tiết cách làm).
  - `customImage` (Link ảnh mẫu khách gửi).
  - `customizationPrice` (Phí phụ thu cho việc thiết kế).
- **Tài chính:** Theo dõi được số tiền khách đã thanh toán (Paid Amount) và số tiền còn lại phải thu (Remaining Amount).

### 3.4. Quản Lý Người Dùng (`AdminUsers.tsx`)
- **Nghiệp vụ:** CRUD quản trị viên và tài khoản người dùng/seller.
- **Flow:**
  - **Đọc:** Bảng hiển thị thông tin user (Avatar, Tên, Liên hệ). Có bộ lọc tìm kiếm theo Role (`USER`, `SELLER`, `ADMIN`).
  - **Sửa (Role & Status):**
    - Cập nhật quyền trực tiếp qua một Dropdown trên bảng.
    - Khóa / Mở khóa tài khoản (Toggle `ACTIVE` <-> `BANNED`) bằng nút Lock/Unlock trực tiếp trên bảng.
  - **Thêm:** Modal điền form (Tên, Email, Pass, Phone, Role) để tạo tài khoản mới (thường dùng tạo thêm Seller/Admin).
  - **Xóa:** Xóa vĩnh viễn tài khoản (có modal xác nhận).

---

## 4. QUY TẮC PHÁT TRIỂN TIẾP THEO (GUIDELINES FOR AGENTS)
1. **Luôn sử dụng API Layer có sẵn:** Bất kỳ thao tác gọi backend nào cũng phải được khai báo trong `src/api/sellerApi.ts`. Các endpoints backend Java tương ứng bắt đầu bằng `/api/admin/...`.
2. **Tuân thủ Design System:**
   - Sử dụng thư viện icon **Lucide React**.
   - Style sử dụng TailwindCSS, thiết kế thẻ (Card) viền bo tròn, shadow nhẹ (`shadow-sm ring-1 ring-gray-100`).
   - Feedback UI bằng hàm `showToast('message', 'success' | 'error')` lấy từ `useToast()` hook.
3. **Không phá vỡ ranh giới quyền hạn:** 
   - Seller quản lý hàng hóa và đơn của mình. 
   - Admin quản trị toàn sàn (Kiểm duyệt, Ban/Active, Monitor) nhưng không can thiệp thay đổi dữ liệu của Seller (như cập nhật trạng thái đơn hay sửa mô tả sản phẩm).
