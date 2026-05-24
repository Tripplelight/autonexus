// src/controllers/dealer.controller.js
import { prisma } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendWelcomeEmail } from '../services/email.service.js';

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── Dealer Registration ───────────────────────────────────────────────────────
export const registerDealer = async (req, res, next) => {
  try {
    const { name, email, password, phone, businessName, location, kraPin, description } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 12);
    const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        name, email, password: hashed, phone, role: 'DEALER',
        dealer: {
          create: {
            businessName, phone, location, kraPin, description,
            trialEndsAt,
            subscriptionStatus: 'TRIAL'
          }
        }
      },
      include: { dealer: true }
    });

    sendWelcomeEmail({ user }).catch(console.error);
    const { password: _, ...safe } = user;
    res.status(201).json({ token: signToken(user.id, user.role), user: safe });
  } catch (err) { next(err); }
};

// ── Get dealer profile ────────────────────────────────────────────────────────
export const getDealerProfile = async (req, res, next) => {
  try {
    const dealer = await prisma.dealer.findUnique({
      where: { userId: req.user.id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        _count: { select: { cars: true, orders: true } }
      }
    });
    if (!dealer) return res.status(404).json({ message: 'Dealer profile not found' });
    res.json(dealer);
  } catch (err) { next(err); }
};

// ── Update dealer profile ─────────────────────────────────────────────────────
export const updateDealerProfile = async (req, res, next) => {
  try {
    const { businessName, phone, location, kraPin, description } = req.body;
    const logo = req.file?.path;
    const dealer = await prisma.dealer.update({
      where: { userId: req.user.id },
      data: {
        ...(businessName && { businessName }),
        ...(phone && { phone }),
        ...(location && { location }),
        ...(kraPin && { kraPin }),
        ...(description && { description }),
        ...(logo && { logo })
      }
    });
    res.json(dealer);
  } catch (err) { next(err); }
};

// ── Get dealer's own cars ─────────────────────────────────────────────────────
export const getDealerCars = async (req, res, next) => {
  try {
    const dealer = await prisma.dealer.findUnique({ where: { userId: req.user.id } });
    if (!dealer) return res.status(404).json({ message: 'Dealer not found' });
    const cars = await prisma.car.findMany({
      where: { dealerId: dealer.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(cars);
  } catch (err) { next(err); }
};

// ── Get dealer's orders ───────────────────────────────────────────────────────
export const getDealerOrders = async (req, res, next) => {
  try {
    const dealer = await prisma.dealer.findUnique({ where: { userId: req.user.id } });
    if (!dealer) return res.status(404).json({ message: 'Dealer not found' });
    const orders = await prisma.order.findMany({
      where: { dealerId: dealer.id },
      include: {
        car: { select: { make: true, model: true, year: true, images: true } },
        user: { select: { name: true, email: true, phone: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (err) { next(err); }
};

// ── Check subscription status ─────────────────────────────────────────────────
export const checkSubscription = async (req, res, next) => {
  try {
    const dealer = await prisma.dealer.findUnique({ where: { userId: req.user.id } });
    if (!dealer) return res.status(404).json({ message: 'Dealer not found' });

    const now = new Date();
    let status = dealer.subscriptionStatus;
    let daysLeft = 0;

    if (status === 'TRIAL') {
      daysLeft = Math.ceil((dealer.trialEndsAt - now) / (1000 * 60 * 60 * 24));
      // Only expire if trial has actually ended
      if (daysLeft <= 0) {
        await prisma.dealer.update({
          where: { id: dealer.id },
          data: { subscriptionStatus: 'EXPIRED' }
        });
        status = 'EXPIRED';
        daysLeft = 0;
      }
    } else if (status === 'ACTIVE') {
      // Only check subscription expiry if subscriptionEndsAt is set
      if (dealer.subscriptionEndsAt) {
        daysLeft = Math.ceil((dealer.subscriptionEndsAt - now) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 0) {
          await prisma.dealer.update({
            where: { id: dealer.id },
            data: { subscriptionStatus: 'EXPIRED' }
          });
          status = 'EXPIRED';
          daysLeft = 0;
        }
      } else {
        // No end date set — treat as indefinitely active
        daysLeft = 999;
      }
    }

    res.json({
      status,
      daysLeft,
      trialEndsAt: dealer.trialEndsAt,
      subscriptionEndsAt: dealer.subscriptionEndsAt
    });
  } catch (err) { next(err); }
};

// ── SUPER ADMIN: Get all dealers ──────────────────────────────────────────────
export const getAllDealers = async (req, res, next) => {
  try {
    const dealers = await prisma.dealer.findMany({
      include: {
        user: { select: { name: true, email: true, createdAt: true } },
        _count: { select: { cars: true, orders: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(dealers);
  } catch (err) { next(err); }
};

// ── SUPER ADMIN: Update dealer subscription ───────────────────────────────────
export const updateDealerSubscription = async (req, res, next) => {
  try {
    const { dealerId } = req.params;
    const { status, months = 1 } = req.body;

    const subscriptionEndsAt = new Date();
    subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + parseInt(months));

    const dealer = await prisma.dealer.update({
      where: { id: dealerId },
      data: {
        subscriptionStatus: status,
        ...(status === 'ACTIVE' && { subscriptionEndsAt })
      }
    });

    if (status === 'ACTIVE') {
      await prisma.subscription.create({
        data: {
          dealerId,
          amount: 5000 * months,
          status: 'PAID',
          period: new Date().toISOString().slice(0, 7)
        }
      });
    }

    res.json(dealer);
  } catch (err) { next(err); }
};

// ── SUPER ADMIN: Suspend dealer ───────────────────────────────────────────────
export const suspendDealer = async (req, res, next) => {
  try {
    const { dealerId } = req.params;
    const dealer = await prisma.dealer.update({
      where: { id: dealerId },
      data: { subscriptionStatus: 'SUSPENDED' }
    });
    res.json(dealer);
  } catch (err) { next(err); }
};