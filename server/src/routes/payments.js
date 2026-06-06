// server/src/routes/payments.js
import { Router } from 'express';
import {
  initiateSubscriptionPayment,
  mpesaCallback,
  checkPaymentStatus,
  manualActivate
} from '../controllers/mpesa.controller.js';
import { protect, dealerOnly, superAdminOnly } from '../middleware/auth.js';

const router = Router();

// Dealer — initiate STK push
router.post('/mpesa/subscribe', protect, dealerOnly, initiateSubscriptionPayment);

// Safaricom callback — no auth (Safaricom calls this)
router.post('/mpesa/callback', mpesaCallback);

// Frontend polling to check payment status
router.get('/mpesa/status/:checkoutRequestId', protect, dealerOnly, checkPaymentStatus);

// Super Admin — manual fallback activation
router.post('/mpesa/manual-activate', protect, superAdminOnly, manualActivate);

export default router;