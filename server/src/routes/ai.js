// src/routes/ai.js
import { Router } from 'express';
import { chat, predictPrice, smartSearch, virtualTestDrive } from '../controllers/ai.controller.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();
router.post('/chat', optionalAuth, chat);
router.post('/price-predict', predictPrice);
router.post('/smart-search', smartSearch);
router.post('/test-drive/:carId', optionalAuth, virtualTestDrive);

export default router;
