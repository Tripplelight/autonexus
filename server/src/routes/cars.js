// src/routes/cars.js
import { Router } from 'express';
import { getCars, getCarById, createCar, updateCar, deleteCar, toggleFavorite, getFavorites } from '../controllers/cars.controller.js';
import { protect, dealerOrAdmin } from '../middleware/auth.js';
import { requireActiveSubscription } from '../middleware/subscription.js';
import { upload } from '../config/cloudinary.js';

const router = Router();

router.get('/', getCars);
router.get('/favorites', protect, getFavorites);
router.get('/:id', getCarById);
// Mutations require an active subscription for dealers (admins bypass in middleware).
router.post('/', protect, dealerOrAdmin, requireActiveSubscription, upload.array('images', 10), createCar);
router.put('/:id', protect, dealerOrAdmin, requireActiveSubscription, upload.array('images', 10), updateCar);
router.delete('/:id', protect, dealerOrAdmin, requireActiveSubscription, deleteCar);
router.post('/:carId/favorite', protect, toggleFavorite);

export default router;