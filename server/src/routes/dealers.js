import { Router } from 'express';
import {
  registerDealer, getDealerProfile, updateDealerProfile,
  getDealerCars, getDealerOrders, checkSubscription,
  getAllDealers, updateDealerSubscription, suspendDealer,
  getAllPayments, completeDealerRegistration, googleAuthDealer
} from '../controllers/dealer.controller.js';
import { protect, dealerOnly, superAdminOnly, optionalAuth } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = Router();

// Public
router.post('/register', registerDealer);
router.post('/google-auth', googleAuthDealer);
router.post('/complete-registration', optionalAuth, completeDealerRegistration);

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