import express from 'express';
const router = express.Router();
import {
  getCoupons,
  createCoupon,
  deleteCoupon,
  validateCoupon,
} from '../controllers/couponController.js'; // 👈 Import từ Controller cậu đã viết
import { protect, admin } from '../middleware/authMiddleware.js';

// ADMIN: Lấy danh sách & Tạo mã (Cần quyền Admin)
router.route('/')
  .get(protect, getCoupons)
  .post(protect, admin, createCoupon);

// USER: Kiểm tra mã (Public hoặc Protect tùy cậu, ở đây để public cho tiện)
router.post('/validate', validateCoupon);

// ADMIN: Xóa mã theo ID
router.route('/:id').delete(protect, admin, deleteCoupon);

export default router;