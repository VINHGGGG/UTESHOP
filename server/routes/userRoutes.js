import express from 'express'
const router = express.Router()
import {
  authUser,
  registerUser,
  verifyUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  forgotPassword, 
  resetPassword
} from '../controllers/userController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

// Route gốc /api/users
router.route('/')
  .post(registerUser)
  .get(protect, admin, getUsers) // Chỉ Admin mới xem được list user
router.route('/verify/:token').get(verifyUser)
router.post('/forgotpassword', forgotPassword)
router.put('/resetpassword/:resetToken', resetPassword)

// Route login
router.post('/login', authUser)

// Route profile
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)

// Route theo ID: /api/users/:id (Admin only)
router.route('/:id')
  .delete(protect, admin, deleteUser) // Xóa
  .get(protect, admin, getUserById)   // Xem chi tiết
  .put(protect, admin, updateUser)    // Sửa quyền

export default router