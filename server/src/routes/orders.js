// src/routes/orders.js
import { Router } from 'express';
import { createOrder, getBankDetails, getUserOrders, getAllOrders, updateOrderStatus } from '../controllers/orders.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { orderRules, validate } from '../middleware/validate.js';

const router = Router();

// Public — Mpesa callback removed, bank transfer only now
router.use(protect);
router.post('/', orderRules, validate, createOrder);
router.get('/my', getUserOrders);
router.get('/bank-details', getBankDetails);
router.get('/', adminOnly, getAllOrders);
router.patch('/:id/status', adminOnly, updateOrderStatus);

export default router;