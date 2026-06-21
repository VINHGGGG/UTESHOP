// Mật khẩu mình để là "123456" cho dễ nhớ nhé
// Lưu ý: Đây là mật khẩu thô (chưa mã hóa), dùng để test ban đầu.
// Sau này làm chức năng Đăng nhập, mình sẽ thêm cơ chế mã hóa (bcrypt) sau.

const users = [
  {
    fullName: "Admin Shop",
    email: "admin@example.com",
    password: "123", 
    isAdmin: true, // Đây là tài khoản Admin
    phone: "0909000111",
    address: "Hà Nội, Việt Nam"
  },
  {
    fullName: "Khách Hàng Mẫu",
    email: "user@example.com",
    password: "123",
    isAdmin: false, // Đây là tài khoản khách thường
    phone: "0909000222",
    address: "TP. Hồ Chí Minh, Việt Nam"
  }
];

module.exports = users;