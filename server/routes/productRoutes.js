import express from 'express'
const router = express.Router()
import {
  getProducts,
  getProductById,
  deleteProduct,
  updateProduct, // Import mới
  createProduct, // Import mới
} from '../controllers/productController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

// 1. Route gốc (/api/products)
router.route('/')
  .get(getProducts) // Ai cũng xem được
  .post(protect, admin, createProduct) // Chỉ admin được tạo

// 2. Route theo ID (/api/products/:id)
router.route('/:id')
  .get(getProductById) // Ai cũng xem được chi tiết
  .delete(protect, admin, deleteProduct) // Chỉ admin được xóa
  .put(protect, admin, updateProduct) // Chỉ admin được sửa

export default router