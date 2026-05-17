// src/routes/users.js
import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { prisma } from '../config/db.js';

const router = Router();
router.use(protect);

router.get('/', adminOnly, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (err) { next(err); }
});

router.patch('/profile', async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone },
      select: { id: true, name: true, email: true, phone: true }
    });
    res.json(user);
  } catch (err) { next(err); }
});

export default router;
