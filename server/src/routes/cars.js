// src/routes/cars.js
import { Router } from 'express';
import { getCars, getCarById, createCar, updateCar, deleteCar, toggleFavorite, getFavorites } from '../controllers/cars.controller.js';
import { protect, adminOnly, dealerOrAdmin } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = Router();

router.get('/', getCars);
router.get('/favorites', protect, getFavorites);
router.get('/:id', getCarById);
router.post('/', protect, dealerOrAdmin, upload.array('images', 10), createCar);
router.put('/:id', protect, dealerOrAdmin, upload.array('images', 10), updateCar);
router.delete('/:id', protect, dealerOrAdmin, deleteCar);
router.post('/:carId/favorite', protect, toggleFavorite);

export default router;