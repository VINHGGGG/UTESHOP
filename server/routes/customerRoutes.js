import express from 'express';
import asyncHandler from 'express-async-handler';
import Customer from '../models/CustomerModel.js'; // Nhớ check đúng tên file Model của cậu nha
import { protect } from '../middleware/authMiddleware.js'; // Bảo vệ api, chỉ nhân viên đăng nhập mới dùng được

const router = express.Router();

// @desc    Tìm kiếm khách hàng theo Số Điện Thoại
// @route   GET /api/customers/search
// @access  Private (Chỉ thu ngân/nhân viên dùng)
router.get(
  '/search',
  protect,
  asyncHandler(async (req, res) => {
    const { phone } = req.query;

    if (!phone) {
      res.status(400);
      throw new Error('Vui lòng cung cấp số điện thoại cần tìm');
    }

    // Tìm kiếm khách hàng dựa trên SĐT chính xác
    const customer = await Customer.findOne({ phone: phone.trim() });

    if (customer) {
      res.status(200).json(customer);
    } else {
      res.status(404);
      throw new Error('Không tìm thấy khách hàng thành viên với số điện thoại này');
    }
  })
);

// @desc    Đăng ký thẻ thành viên mới tại quầy
// @route   POST /api/customers
// @access  Private
// @desc    Đăng ký thẻ thành viên mới tại quầy
// @route   POST /api/customers
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, phone } = req.body;

    // 1. Kiểm tra xem Front-end có gửi thiếu dữ liệu không
    if (!name || !phone) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ Tên và Số điện thoại khách hàng!' });
    }

    // 2. Kiểm tra xem SĐT này đã có tài khoản thành viên chưa
    const customerExists = await Customer.findOne({ phone: phone.trim() });
    if (customerExists) {
      return res.status(400).json({ message: 'Số điện thoại này đã được đăng ký thành viên từ trước' });
    }

    // 3. Tiến hành tạo mới trong Database
    const customer = new Customer({
      name: name.trim(),
      phone: phone.trim(),
    });

    const createdCustomer = await customer.save();
    
    // 4. Trả dữ liệu thành công về cho Front-end
    return res.status(201).json(createdCustomer);

  } catch (error) {
    // Đoạn này sẽ in lỗi thực sự ra terminal của VSCode nếu có lỗi sập DB
    console.error('💥 LỖI BACKEND TẠO KHÁCH HÀNG:', error);
    return res.status(500).json({ message: error.message || 'Lỗi hệ thống Backend không xác định!' });
  }
});

export default router;