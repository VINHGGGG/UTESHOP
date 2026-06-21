import express from 'express';
const router = express.Router();
import { openShift, getCurrentShift, closeShift } from '../controllers/shiftController.js';
import { protect } from '../middleware/authMiddleware.js'; // Đảm bảo dùng middleware bắt đăng nhập của cậu nhé

router.route('/open').post(protect, openShift);
router.route('/current').get(protect, getCurrentShift);
router.route('/close').put(protect, closeShift);

export default router;