# Giao diện MilkTea Shop - Frontend Client

Dự án giao diện Client dành cho ứng dụng đặt trà sữa trực tuyến. Ứng dụng được xây dựng dưới dạng Single Page Application (SPA), giúp khách hàng dễ dàng xem thực đơn, tùy chọn thông số đồ uống, quản lý giỏ hàng, đặt hàng thanh toán và theo dõi trạng thái đơn hàng.

---

## Tính Năng Chính

* **Thực đơn và Tùy biến sản phẩm**: Hiển thị danh sách sản phẩm theo danh mục và sản phẩm khuyến mãi. Hỗ trợ tùy chỉnh kích cỡ (Size), mức đường, mức đá và lựa chọn thêm nhiều loại topping.
* **Responsive Design**: Tối ưu hóa giao diện cho mọi loại thiết bị (Mobile, Tablet, Desktop), đảm bảo trải nghiệm mượt mà trên mọi kích thước màn hình.
* **Xác thực người dùng**: Đăng ký tài khoản mới, xác minh mã kích hoạt qua email (OTP), và đăng nhập bảo mật bằng Token JWT.
* **Quản lý giỏ hàng thông minh**: Hỗ trợ giỏ hàng tạm thời cho khách vãng lai và tự động gộp dữ liệu đồng bộ lên cơ sở dữ liệu sau khi đăng nhập thành công.
* **Thanh toán và Đặt hàng**: Giao diện đặt hàng tinh gọn, tích hợp áp dụng mã giảm giá (Voucher), chọn phương thức thanh toán và hiển thị mã QR động để chuyển khoản giả lập.
* **Theo dõi đơn hàng**: Tra cứu danh sách đơn hàng đã mua, theo dõi chi tiết trạng thái xử lý đơn hàng và hỗ trợ hủy đơn hàng chờ xử lý.

---

## Công Nghệ Sử Dụng

* **Framework chính**: React v19.2
* **Ngôn ngữ**: TypeScript v5.9
* **Công cụ build**: Vite v8.0
* **Giao diện & Styling**: Tailwind CSS v4.0 (Responsive-first)
* **Quản lý Trạng thái**: Redux Toolkit
* **Quản lý Form**: React Hook Form kết hợp Yup (xác thực dữ liệu đầu vào)
* **Kết nối API**: Axios (với interceptors xử lý đính kèm token tự động và xử lý lỗi tập trung)
* **Thông báo**: React Hot Toast

---

## Cấu Trúc Thư Mục Nổi Bật

```text
src/
├── components/     # Các thành phần giao diện dùng chung và theo module
├── config/         # Cài đặt Axios client và các hằng số dùng chung
├── contexts/       # Bộ quản lý trạng thái bổ trợ (nếu có)
├── hooks/          # Custom Hooks để tiêu thụ trạng thái nhanh (useAuth, useCart)
├── pages/          # Giao diện các trang của ứng dụng (Trang chủ, Giỏ hàng, Đặt hàng...)
├── redux/          # Quản lý trạng thái toàn cục với Redux Toolkit
├── routes/         # Định tuyến bảo mật và điều hướng (AppRoutes, ProtectedRoute)
├── services/       # Các hàm gọi API tương tác với Backend
├── types/          # Định nghĩa kiểu dữ liệu TypeScript
└── utils/          # Hàm định dạng tiền tệ và các hàm bổ trợ khác
```

---

## Hướng Dẫn Cài Đặt và Chạy Dự Án

### Yêu Cầu Trước Khi Cài Đặt
Hệ thống cần cài đặt sẵn **Node.js** (tối thiểu phiên bản v18.0 trở lên) và trình quản lý gói **npm**.

### 1. Tải Mã Nguồn Về Máy
```bash
git clone <url-to-repository>
cd milktea-frontend
```

### 2. Thiết Lập Biến Môi Trường
Tạo tệp `.env` trong thư mục gốc của dự án (sao chép nội dung từ `.env.example` nếu có):
```bash
cp .env.example .env
```
Mở tệp `.env` vừa tạo và định nghĩa đường dẫn kết nối đến Backend của bạn:
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### 3. Cài Đặt Dependencies
```bash
npm install
```

### 4. Khởi Chạy Ở Chế Độ Phát Triển (Development Mode)
```bash
npm run dev
```
Sau khi khởi chạy, truy cập ứng dụng trên trình duyệt tại địa chỉ: **`http://localhost:3000`**

### 5. Biên Dịch Cho Production
Biên dịch dự án thành các tệp tĩnh tối ưu hóa đặt trong thư mục `/dist`:
```bash
npm run build
```
Để chạy thử phiên bản biên dịch tĩnh này ở local:
```bash
npm run preview
```
