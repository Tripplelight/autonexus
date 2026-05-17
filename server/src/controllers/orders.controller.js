// src/controllers/orders.controller.js
import { prisma } from '../config/db.js';
import { stkPush, querySTKStatus } from '../services/mpesa.service.js';
import { sendDealerOrderNotification, sendCustomerOrderConfirmation } from '../services/email.service.js';

const BANK_DETAILS = {
  bankName: process.env.BANK_NAME || 'Equity Bank Kenya',
  accountName: process.env.BANK_ACCOUNT_NAME || 'AutoNexus Limited',
  accountNumber: process.env.BANK_ACCOUNT_NUMBER || '0123456789',
  branch: process.env.BANK_BRANCH || 'Nairobi CBD',
  swiftCode: process.env.BANK_SWIFT || 'EQBLKENA'
};

// ── Create order + trigger Mpesa STK push for deposits ────────────────────────
export const createOrder = async (req, res, next) => {
  try {
    const { carId, type, notes, phone } = req.body;

    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car || car.status !== 'AVAILABLE')
      return res.status(400).json({ message: 'Car not available' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const depositAmount = car.price * 0.1;
    const amount = type === 'DEPOSIT' ? depositAmount : car.price;

    const order = await prisma.order.create({
      data: { userId: req.user.id, carId, type, amount, notes },
      include: { car: true }
    });

    let mpesaResponse = null;

    // Trigger STK push for deposits
    if (type === 'DEPOSIT') {
      const customerPhone = phone || user.phone;
      if (!customerPhone)
        return res.status(400).json({ message: 'Phone number required for Mpesa payment' });

      try {
        mpesaResponse = await stkPush({
          phone: customerPhone,
          amount: depositAmount,
          orderId: order.id,
          carName: `${car.year} ${car.make} ${car.model}`
        });

        // Save checkout request ID for status queries
        await prisma.order.update({
          where: { id: order.id },
          data: { stripeId: mpesaResponse.CheckoutRequestID } // reusing stripeId field for checkout ID
        });
      } catch (mpesaErr) {
        console.error('[MPESA STK ERROR]', mpesaErr.message);
        return res.status(502).json({ message: 'Mpesa payment initiation failed. Try again.' });
      }
    }

    // Send email notifications non-blocking
    sendDealerOrderNotification({ order, car, user }).catch(console.error);
    sendCustomerOrderConfirmation({ order, car, user }).catch(console.error);

    res.status(201).json({
      order,
      mpesa: mpesaResponse ? {
        checkoutRequestId: mpesaResponse.CheckoutRequestID,
        message: 'STK push sent to your phone. Enter your Mpesa PIN to complete.'
      } : null,
      bankDetails: type === 'INQUIRY' ? null : BANK_DETAILS,
      balanceAmount: type === 'DEPOSIT' ? car.price - depositAmount : null
    });
  } catch (err) { next(err); }
};

// ── Query Mpesa payment status ─────────────────────────────────────────────────
export const checkPaymentStatus = async (req, res, next) => {
  try {
    const { checkoutRequestId } = req.params;
    const status = await querySTKStatus(checkoutRequestId);

    // ResultCode 0 = success
    if (status.ResultCode === '0') {
      // Update order status
      await prisma.order.updateMany({
        where: { stripeId: checkoutRequestId },
        data: { status: 'CONFIRMED' }
      });
      return res.json({ paid: true, message: 'Payment confirmed!' });
    }

    res.json({ paid: false, message: 'Payment pending or failed', resultCode: status.ResultCode });
  } catch (err) { next(err); }
};

// ── Mpesa callback (called by Safaricom servers) ───────────────────────────────
export const mpesaCallback = async (req, res, next) => {
  try {
    const { Body } = req.body;
    const { stkCallback } = Body;
    const { CheckoutRequestID, ResultCode } = stkCallback;

    if (ResultCode === 0) {
      // Payment successful
      await prisma.order.updateMany({
        where: { stripeId: CheckoutRequestID },
        data: { status: 'CONFIRMED' }
      });

      // Reserve the car
      const order = await prisma.order.findFirst({ where: { stripeId: CheckoutRequestID } });
      if (order) {
        await prisma.car.update({ where: { id: order.carId }, data: { status: 'RESERVED' } });
      }
    }

    // Always respond 200 to Safaricom
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' }); // still respond 200
  }
};

// ── Get user orders ───────────────────────────────────────────────────────────
export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { car: { select: { make: true, model: true, year: true, images: true, price: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (err) { next(err); }
};

// ── Get all orders (admin) ────────────────────────────────────────────────────
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        car: { select: { make: true, model: true, year: true, images: true } },
        user: { select: { name: true, email: true, phone: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (err) { next(err); }
};

// ── Update order status (admin) ───────────────────────────────────────────────
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status }
    });
    if (status === 'CONFIRMED' && order.type !== 'INQUIRY') {
      await prisma.car.update({ where: { id: order.carId }, data: { status: 'RESERVED' } });
    }
    if (status === 'CANCELLED') {
      await prisma.car.update({ where: { id: order.carId }, data: { status: 'AVAILABLE' } });
    }
    res.json(order);
  } catch (err) { next(err); }
};

// ── Get bank details ──────────────────────────────────────────────────────────
export const getBankDetails = async (req, res) => {
  res.json(BANK_DETAILS);
};