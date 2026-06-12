// src/routes/orders.js
import { Router } from 'express';
import { protect, adminOnly, dealerOnly } from '../middleware/auth.js';
import { orderRules, validate } from '../middleware/validate.js';
import { createOrder, getBankDetails, getUserOrders, getAllOrders, updateOrderStatus, dealerUpdateOrderStatus } from '../controllers/orders.controller.js';


const router = Router();

// Public — Mpesa callback removed, bank transfer only now
router.use(protect);
router.post('/', orderRules, validate, createOrder);
router.get('/my', getUserOrders);
router.get('/bank-details', getBankDetails);
router.get('/', adminOnly, getAllOrders);
router.patch('/:id/status', adminOnly, updateOrderStatus);
router.patch('/:id/dealer-action', dealerOnly, dealerUpdateOrderStatus);

export default router;