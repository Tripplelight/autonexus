import { Router } from 'express';
import {
  registerDealer, getDealerProfile, updateDealerProfile,
  getDealerCars, getDealerOrders, checkSubscription,
  getAllDealers, updateDealerSubscription, suspendDealer,
  upgradeToDealer, getAllPayments
} from '../controllers/dealer.controller.js';
import { protect, dealerOnly, superAdminOnly } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = Router();

// Public
router.post('/register', registerDealer);

// Logged-in, any role → upgrade to dealer
router.post('/upgrade', protect, upgradeToDealer);

// Dealer protected
router.get('/profile', protect, dealerOnly, getDealerProfile);
router.patch('/profile', protect, dealerOnly, upload.single('logo'), updateDealerProfile);
router.get('/my-cars', protect, dealerOnly, getDealerCars);
router.get('/my-orders', protect, dealerOnly, getDealerOrders);
router.get('/subscription', protect, dealerOnly, checkSubscription);
router.patch('/subscription', protect, dealerOnly, updateDealerSubscription);

// Super admin
router.get('/', protect, superAdminOnly, getAllDealers);
router.patch('/:dealerId/subscription', protect, superAdminOnly, updateDealerSubscription);
router.patch('/:dealerId/suspend', protect, superAdminOnly, suspendDealer);
router.get('/payments/all', protect, superAdminOnly, getAllPayments);

export default router;