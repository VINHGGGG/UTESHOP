import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/UserModel.js';

// 1. Hàm xác thực đăng nhập (Người dùng bình thường)
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Kiểm tra header có dạng "Bearer abcxyz..."
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Lấy token (bỏ chữ Bearer đi)
      token = req.headers.authorization.split(' ')[1];

      // Giải mã token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Tìm user trong DB (trừ field password ra) và gán vào req.user
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Cho phép đi tiếp
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// 2. Hàm xác thực Admin (BÁC BẢO VỆ VIP) - CÁI NÀY MỚI NÈ
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next(); // Ok, anh là sếp, mời anh vào!
  } else {
    res.status(401); // 401: Không được phép
    throw new Error('Not authorized as an admin');
  }
};

export { protect, admin };