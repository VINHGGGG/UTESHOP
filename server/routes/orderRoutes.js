import express from 'express';
// 👇 Đây là dòng cậu bị thiếu nè: Khởi tạo Router
const router = express.Router(); 

import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderToDelivered,
  getDashboardStats,
  deleteOrder,
  returnOrder
} from '../controllers/orderController.js'; // Import logic từ file trên
import { protect, admin } from '../middleware/authMiddleware.js';

// Định tuyến
router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/dashboard-stats').get(protect, admin, getDashboardStats);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/deliver').put(protect, updateOrderToDelivered);
router.route('/:id/return').put(protect, admin, returnOrder);
router.route('/:id').delete(protect, deleteOrder)

// Export router để server.js dùng
export default router;