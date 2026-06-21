import asyncHandler from 'express-async-handler';
import Shift from '../models/ShiftModel.js';
import Order from '../models/OrderModel.js';

// @desc    Mở ca làm việc mới (Nhân viên vào ca nhập tiền lẻ trong két)
// @route   POST /api/shifts/open
// @access  Private
const openShift = asyncHandler(async (req, res) => {
  const { startAmount } = req.body;

  // 🌟 KIỂM TRA PHÂN QUYỀN: Admin không được quyền mở ca trực bán hàng
  if (req.user && req.user.isAdmin) {
    res.status(403);
    throw new Error('Tài khoản Quản trị viên (Admin) không có quyền tham gia ca trực bán hàng!');
  }

  // Kiểm tra xem nhân viên này đã có ca nào đang MỞ (Open) mà chưa đóng không
  const activeShift = await Shift.findOne({ user: req.user._id, status: 'Open' });
  if (activeShift) {
    res.status(400);
    throw new Error('Bạn đang có một ca trực chưa chốt. Hãy chốt ca cũ trước khi mở ca mới!');
  }

  const shift = new Shift({
    user: req.user._id,
    startAmount,
    expectedAmount: startAmount,
    status: 'Open',
    openedAt: Date.now(),
  });

  const createdShift = await shift.save();
  res.status(201).json(createdShift);
});

// @desc    Lấy thông tin ca hiện tại kèm số tiền tạm tính hệ thống (Real-time tracking)
// @route   GET /api/shifts/current
// @access  Private
const getCurrentShift = asyncHandler(async (req, res) => {
  const shift = await Shift.findOne({ user: req.user._id, status: 'Open' });

  if (!shift) {
    return res.status(200).json(null); // Trả về null báo hiệu chưa vào ca
  }

  // Quét toàn bộ hóa đơn được tạo từ lúc Mở ca (openedAt) đến Hiện tại của user này
  const orders = await Order.find({
    user: req.user._id,
    createdAt: { $gte: shift.openedAt },
    isReturned: false, // Bỏ qua các đơn đã bị trả hàng
  });

  // Gom nhóm doanh thu theo phương thức thanh toán
  let cash = 0;
  let transfer = 0;
  let card = 0;

  orders.forEach((order) => {
    if (order.paymentMethod === 'Tiền mặt' || order.paymentMethod === 'COD') cash += order.totalPrice;
    if (order.paymentMethod === 'Chuyển khoản') transfer += order.totalPrice;
    if (order.paymentMethod === 'Quẹt thẻ') card += order.totalPrice;
  });

  // Cập nhật số liệu tạm tính vào object ca trực để trả về Frontend hiển thị
  shift.cashSales = cash;
  shift.transferSales = transfer;
  shift.cardSales = card;
  shift.totalSales = cash + transfer + card;
  shift.expectedAmount = shift.startAmount + cash; // Két phải có = Tiền mồi + Tiền mặt bán được

  res.json(shift);
});

// @desc    Chốt ca làm việc & Kiểm két tiền (Đóng ca)
// @route   PUT /api/shifts/close
// @access  Private
const closeShift = asyncHandler(async (req, res) => {
  const { endAmountReal, note } = req.body;

  const shift = await Shift.findOne({ user: req.user._id, status: 'Open' });
  if (!shift) {
    res.status(404);
    throw new Error('Không tìm thấy ca làm việc đang mở để đóng!');
  }

  // 1. Tính toán lại toàn bộ doanh thu thực tế trong ca một lần nữa để chốt sổ
  const orders = await Order.find({
    user: req.user._id,
    createdAt: { $gte: shift.openedAt },
    isReturned: false,
  });

  let cash = 0, transfer = 0, card = 0;
  orders.forEach((order) => {
    if (order.paymentMethod === 'Tiền mặt' || order.paymentMethod === 'COD') cash += order.totalPrice;
    if (order.paymentMethod === 'Chuyển khoản') transfer += order.totalPrice;
    if (order.paymentMethod === 'Quẹt thẻ') card += order.totalPrice;
  });

  // 2. Điền số liệu tài chính cuối cùng
  shift.cashSales = cash;
  shift.transferSales = transfer;
  shift.cardSales = card;
  shift.totalSales = cash + transfer + card;
  shift.expectedAmount = shift.startAmount + cash;
  
  shift.endAmountReal = endAmountReal;
  shift.difference = endAmountReal - shift.expectedAmount; // Thừa (+) hoặc Thiếu (-) tiền
  shift.note = note;
  shift.status = 'Closed';
  shift.closedAt = Date.now();

  const updatedShift = await shift.save();
  res.json(updatedShift);
});

export { openShift, getCurrentShift, closeShift };