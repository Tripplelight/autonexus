// src/controllers/auth.controller.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { sendWelcomeEmail } from '../services/email.service.js';

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, phone },
      select: { id: true, name: true, email: true, role: true }
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail({ user }).catch(console.error);

    res.status(201).json({ token: signToken(user.id, user.role), user });
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    const { password: _, ...safe } = user;
    res.json({ token: signToken(user.id, user.role), user: safe });
  } catch (err) { next(err); }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
      include: undefined
    });
    res.json(user);
  } catch (err) { next(err); }
};

import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'No credential provided' });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub: googleId, email, name, picture } = ticket.getPayload();

    // Find existing user by googleId or email
    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
    });

    if (user) {
      // Link googleId if they registered with email before
      if (!user.googleId) {
        await prisma.user.update({ where: { id: user.id }, data: { googleId } });
      }
    } else {
      // Create new user
      user = await prisma.user.create({
        data: { name, email, googleId, phone: null },
      });
      sendWelcomeEmail({ user }).catch(console.error);
    }

    const { password: _, ...safe } = user;
    res.json({ token: signToken(user.id, user.role), user: safe });
  } catch (err) { next(err); }
};