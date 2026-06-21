import asyncHandler from 'express-async-handler'
import Order from '../models/OrderModel.js'
import User from '../models/UserModel.js'

/**
 * @desc    Lấy thống kê tổng quan cho Admin Dashboard
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
const getAdminDashboardStats = asyncHandler(async (req, res) => {
  // Tổng số người dùng
  const totalUsers = await User.countDocuments()

  // Tổng số đơn hàng
  const totalOrders = await Order.countDocuments()

  // Tổng doanh thu (chỉ tính đơn đã thanh toán)
  const revenueResult = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' },
      },
    },
  ])

  const totalRevenue =
    revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0

  res.json({
    totalUsers,
    totalOrders,
    totalRevenue,
  })
})

export { getAdminDashboardStats }
