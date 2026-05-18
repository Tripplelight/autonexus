// src/routes/cars.js
import { Router } from 'express';
import { getCars, getCarById, createCar, updateCar, deleteCar, toggleFavorite, getFavorites } from '../controllers/cars.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = Router();

router.get('/', getCars);
router.get('/favorites', protect, getFavorites);
router.get('/:id', getCarById);
router.post('/', protect, adminOnly, upload.array('images', 10), createCar);
router.put('/:id', protect, adminOnly, upload.array('images', 10), updateCar);
router.delete('/:id', protect, adminOnly, deleteCar);
router.post('/:carId/favorite', protect, toggleFavorite);

export default router;