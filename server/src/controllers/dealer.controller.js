// src/controllers/dealer.controller.js
import { prisma } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendWelcomeEmail } from '../services/email.service.js';
import { computeSubscription, syncDealerStatus } from '../utils/subscription.js';

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
    // Attach the canonical, derived subscription shape so the frontend never has
    // to read the raw (possibly stale) subscriptionStatus field.
    res.json({ ...dealer, subscription: computeSubscription(dealer) });
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

// ── Get dealer public profile ─────────────────────────────────────────────────
export const getDealerPublicProfile = async (req, res, next) => {
  try {
    const dealer = await prisma.dealer.findUnique({
      where: { id: req.params.dealerId },
      select: {
        id: true,
        businessName: true,
        location: true,
        phone: true,
        logo: true,
        description: true,
        _count: { select: { cars: true } }
      }
    });
    if (!dealer) return res.status(404).json({ message: 'Dealer not found' });
    res.json(dealer);
  } catch (err) { next(err); }
};

// ── Check subscription status ─────────────────────────────────────────────────
export const checkSubscription = async (req, res, next) => {
  try {
    const dealer = await prisma.dealer.findUnique({ where: { userId: req.user.id } });
    if (!dealer) return res.status(404).json({ message: 'Dealer not found' });

    // Single source of truth: derive effective state and lazily persist drift.
    const subscription = await syncDealerStatus(dealer);
    res.json(subscription);
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
    // Attach the derived subscription shape so the admin UI shows effective state,
    // not the raw (possibly stale) stored status. Read-only — no persistence here.
    res.json(dealers.map(d => ({ ...d, subscription: computeSubscription(d) })));
  } catch (err) { next(err); }
};

// ── Update / Renew Subscription (Dealer Self + Super Admin) ─────────────────
export const updateDealerSubscription = async (req, res, next) => {
  try {
    const { months = 1 } = req.body;
    let dealerId;

    // Dealer renewing themselves
    if (req.user.role === 'DEALER') {
      const dealer = await prisma.dealer.findUnique({
        where: { userId: req.user.id }
      });
      if (!dealer) return res.status(404).json({ message: 'Dealer profile not found' });
      dealerId = dealer.id;
    } 
    // Super Admin updating any dealer
    else if (req.user.role === 'SUPER_ADMIN' && req.params.dealerId) {
      dealerId = req.params.dealerId;
    } 
    else {
      return res.status(403).json({ message: 'Access denied' });
    }

    const subscriptionEndsAt = new Date();
    subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + parseInt(months));

    const updatedDealer = await prisma.dealer.update({
      where: { id: dealerId },
      data: {
        subscriptionStatus: 'ACTIVE',
        subscriptionEndsAt,
      }
    });

    // Record payment history
    await prisma.subscription.create({
      data: {
        dealerId,
        amount: 5000 * parseInt(months),
        status: 'PAID',
        period: new Date().toISOString().slice(0, 7),
      }
    });

    res.json({
      success: true,
      message: 'Subscription renewed successfully',
      subscriptionEndsAt: updatedDealer.subscriptionEndsAt,
      status: updatedDealer.subscriptionStatus
    });
  } catch (err) {
    next(err);
  }
};

// ── SUPER ADMIN: Suspend Dealer ───────────────────────────────────────────────
export const suspendDealer = async (req, res, next) => {
  try {
    const dealer = await prisma.dealer.update({
      where: { id: req.params.dealerId },
      data: { subscriptionStatus: 'SUSPENDED' },
      include: {
        user: { select: { name: true, email: true, createdAt: true } },
        _count: { select: { cars: true, orders: true } }
      }
    });

    res.json(dealer);
  } catch (err) {
    next(err);
  }
};
