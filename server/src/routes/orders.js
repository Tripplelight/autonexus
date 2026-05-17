// src/routes/orders.js
import { Router } from 'express';
import {
  createOrder, checkPaymentStatus, mpesaCallback,
  getUserOrders, getAllOrders, updateOrderStatus, getBankDetails
} from '../controllers/orders.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { orderRules, validate } from '../middleware/validate.js';

const router = Router();

// Public — Mpesa callback (called by Safaricom, no auth)
router.post('/mpesa/callback', mpesaCallback);

// Protected
router.use(protect);
router.post('/', orderRules, validate, createOrder);
router.get('/my', getUserOrders);
router.get('/bank-details', getBankDetails);
router.get('/mpesa/status/:checkoutRequestId', checkPaymentStatus);

// Admin
router.get('/', adminOnly, getAllOrders);
router.patch('/:id/status', adminOnly, updateOrderStatus);

export default router;