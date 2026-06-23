# UTESHOP

UTESHOP là một hệ thống bán hàng/POS kết hợp quản trị cửa hàng, gồm:

- Ứng dụng frontend React chạy trên Vite
- Ứng dụng desktop Electron cho môi trường quầy bán hàng
- Backend Node.js/Express kết nối MongoDB

Mục tiêu của dự án là hỗ trợ bán hàng tại quầy, quản lý sản phẩm, đơn hàng, khách hàng, nhà cung cấp, nhập hàng, khuyến mãi và ca làm việc.

## Công nghệ sử dụng

### Client
- React 18
- TypeScript + JavaScript
- Vite
- Redux Toolkit
- React Router
- React Bootstrap / Bootstrap
- Electron

### Server
- Node.js
- Express
- MongoDB + Mongoose
- JWT authentication
- Multer upload file
- Nodemailer gửi email

## Chức năng chính

### Bán hàng / POS
- Tìm kiếm và thêm sản phẩm vào giỏ hàng
- Thanh toán đơn hàng
- Hỗ trợ nhiều phương thức thanh toán
- Áp mã giảm giá
- Tích điểm khách hàng
- Lưu tạm đơn hàng
- Hỗ trợ giao hàng / đơn online

### Quản trị
- Quản lý sản phẩm
- Quản lý danh mục
- Quản lý đơn hàng
- Quản lý người dùng / nhân viên
- Quản lý khách hàng
- Quản lý nhà cung cấp
- Quản lý nhập hàng
- Quản lý coupon / khuyến mãi
- Quản lý ca làm việc
- Thống kê doanh thu và dashboard

### Desktop Electron
- Chạy giao diện dưới dạng ứng dụng desktop
- Hỗ trợ xuất hóa đơn PDF tự động

## Cấu trúc dự án

```text
UTESHOP/
├─ client/        # Frontend React + Electron
└─ server/        # Backend Express + MongoDB
```

## Yêu cầu môi trường

- Node.js 18+ (khuyến nghị)
- MongoDB đang chạy hoặc MongoDB Atlas
- npm

## Cài đặt

### 1. Cài đặt backend

```bash
cd server
npm install
```

### 2. Cài đặt frontend

```bash
cd client
npm install
```

## Biến môi trường

### Backend
Tạo file `.env` trong thư mục `server/` với các biến cơ bản sau:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### Frontend
Trong `client/src/main.tsx`, ứng dụng đang trỏ API mặc định tới backend đã triển khai:

```ts
axios.defaults.baseURL = 'https://uteshop-api.onrender.com'
```

Nếu muốn chạy local, đổi base URL sang địa chỉ backend của bạn, ví dụ:

```ts
axios.defaults.baseURL = 'http://localhost:5000'
```

## Chạy dự án

### Chạy backend

```bash
cd server
npm run dev
```

Hoặc:

```bash
cd server
npm start
```

### Chạy frontend web

```bash
cd client
npm run dev
```

### Đóng gói ứng dụng desktop Windows

```bash
cd client
npm run build-exe
```

## Ghi chú về Electron

Electron đã được cấu hình trong project để hỗ trợ đóng gói ứng dụng desktop.
Trong giai đoạn hiện tại, script chính thức trong client tập trung vào build và xuất file cài đặt Windows.
Nếu muốn mở rộng thêm chế độ chạy Electron trong môi trường phát triển, cần bổ sung script riêng.

## Scripts chính

### Client
- `npm run dev` — chạy Vite dev server
- `npm run build` — build frontend
- `npm run lint` — kiểm tra lint
- `npm run preview` — preview bản build
- `npm run build-exe` — build file cài đặt Electron cho Windows

### Server
- `npm run dev` — chạy backend với nodemon
- `npm start` — chạy backend bằng node
- `npm run data:import` — import dữ liệu mẫu
- `npm run data:destroy` — xóa dữ liệu mẫu

## API chính

Backend hiện có các nhóm API:

- `/api/products`
- `/api/users`
- `/api/orders`
- `/api/categories`
- `/api/coupons`
- `/api/customers`
- `/api/purchases`
- `/api/suppliers`
- `/api/shifts`
- `/api/upload`

## Ghi chú

- Ứng dụng dùng `HashRouter` để phù hợp với Electron.
- Một số màn hình quản trị chỉ hiển thị với tài khoản có quyền admin.
- Dự án đang trong giai đoạn hoàn thiện, README này là bản mô tả sơ bộ để định hướng phát triển tiếp.

## Phát hành

- Sau khi hoàn thiện mã nguồn, nhóm đã tiến hành biên dịch và đóng gói toàn bộ ứng dụng (bao gồm Electron, Node.js và giao diện React) thành một bộ cài đặt độc lập dành cho Windows, dưới dạng tệp thực thi .exe, sử dụng các công cụ đóng gói tiêu chuẩn như Electron Builder hoặc Inno Setup.
- Bản phát hành mẫu này đã được cấu hình sẵn máy chủ (host) và cơ sở dữ liệu MongoDB Atlas, hoạt động tách biệt hoàn toàn với môi trường phát triển nhằm phục vụ việc cài đặt, chạy thử và đánh giá sản phẩm.

## Tài khoản thử nghiệm

### Admin

Email: nhatanh720003@gmail.com
Password: 123

### Nhân viên

Email: nhatanh720002@gmail.com
Password: 123