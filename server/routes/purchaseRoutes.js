import express from 'express';
const router = express.Router();
import {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrderToComplete
} from '../controllers/purchaseController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/')
  .post(protect, admin, createPurchaseOrder)
  .get(protect, admin, getPurchaseOrders);

router.route('/:id')
  .get(protect, admin, getPurchaseOrderById);

router.route('/:id/complete')
  .put(protect, admin, updatePurchaseOrderToComplete);

export default router;