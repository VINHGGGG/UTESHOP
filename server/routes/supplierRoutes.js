import express from 'express';
const router = express.Router();
import {
  createSupplier,
  getSuppliers,
  updateSupplier,
} from '../controllers/supplierController.js';
import { protect, admin } from '../middleware/authMiddleware.js'; // Thay thế bằng tên middleware bảo mật thực tế của cậu nhé

// Đường dẫn /api/suppliers
router.route('/')
  .get(protect, admin, getSuppliers)    // Lấy danh sách
  .post(protect, admin, createSupplier); // Thêm mới

// Đường dẫn /api/suppliers/:id
router.route('/:id')
  .put(protect, admin, updateSupplier);  // Cập nhật thông tin

export default router;