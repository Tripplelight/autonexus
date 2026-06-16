// src/routes/auth.js
import { Router } from 'express';
import { register, login, getMe, googleAuth } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { registerRules, loginRules, validate } from '../middleware/validate.js';

const router = Router();
router.post('/register', registerRules, validate, register);
router.post('/google', googleAuth);
router.post('/login', loginRules, validate, login);
router.get('/me', protect, getMe);

export default router;
