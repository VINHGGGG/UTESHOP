import asyncHandler from '../middleware/asyncHandler.js'
import Coupon from '../models/CouponModel.js'

// @desc    Lấy tất cả mã giảm giá
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({})
  res.json(coupons)
})

// @desc    Tạo mã giảm giá mới
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
  const { name, discount, expiry } = req.body
  
  const couponExists = await Coupon.findOne({ name })
  if (couponExists) {
    res.status(400)
    throw new Error('Mã giảm giá này đã tồn tại')
  }

  const coupon = await Coupon.create({ name, discount, expiry })
  if (coupon) {
    res.status(201).json(coupon)
  } else {
    res.status(400)
    throw new Error('Dữ liệu mã giảm giá không hợp lệ')
  }
})

// @desc    Xóa mã giảm giá
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id)

  if (coupon) {
    await coupon.deleteOne()
    res.json({ message: 'Đã xóa mã giảm giá' })
  } else {
    res.status(404)
    throw new Error('Không tìm thấy mã')
  }
})

// @desc    Kiểm tra mã giảm giá (Dành cho User)
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = asyncHandler(async (req, res) => {
  const { couponCode } = req.body
  
  // Tìm mã (Upper case để không phân biệt hoa thường)
  const coupon = await Coupon.findOne({ name: couponCode.toUpperCase() })

  if (coupon) {
    if (new Date() > coupon.expiry) {
      res.status(400)
      throw new Error('Mã giảm giá đã hết hạn')
    }
    
    // Trả về thông tin để Frontend tính toán
    res.json({
      discount: coupon.discount,
      code: coupon.name,
      message: 'Áp dụng mã thành công!'
    })
  } else {
    res.status(404)
    throw new Error('Mã giảm giá không tồn tại')
  }
})

export { getCoupons, createCoupon, deleteCoupon, validateCoupon }