// src/controllers/orders.controller.js
import { prisma } from '../config/db.js';
import { sendDealerOrderNotification, sendCustomerOrderConfirmation } from '../services/email.service.js';

const BANK_DETAILS = {
  bankName: process.env.BANK_NAME || 'Equity Bank Kenya',
  accountName: process.env.BANK_ACCOUNT_NAME || 'AutoNexus Limited',
  accountNumber: process.env.BANK_ACCOUNT_NUMBER || '0123456789',
  branch: process.env.BANK_BRANCH || 'Nairobi CBD',
  swiftCode: process.env.BANK_SWIFT || 'EQBLKENA',
  pesalink: process.env.BANK_PESALINK || '0123456789'
};

export const createOrder = async (req, res, next) => {
  try {
    const { carId, type, notes } = req.body;

    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car || car.status !== 'AVAILABLE')
      return res.status(400).json({ message: 'Car not available' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const depositAmount = Math.round(car.price * 0.1);
    const amount = type === 'DEPOSIT' ? depositAmount : car.price;

    const order = await prisma.order.create({
      data: { userId: req.user.id, carId, type, amount, notes },
      include: { car: true }
    });

    sendDealerOrderNotification({ order, car, user }).catch(console.error);
    sendCustomerOrderConfirmation({ order, car, user }).catch(console.error);

    res.status(201).json({
      order,
      bankDetails: type !== 'INQUIRY' ? {
        ...BANK_DETAILS,
        amount,
        reference: `AN-${order.id.slice(0, 8).toUpperCase()}`,
        instructions: [
          `Transfer KES ${amount.toLocaleString()} to the account below`,
          `Use reference: AN-${order.id.slice(0, 8).toUpperCase()}`,
          `Send proof of payment to ${process.env.DEALER_EMAIL || 'admin@autonexus.com'}`,
          'Your reservation will be confirmed within 24 hours'
        ]
      } : null
    });
  } catch (err) { next(err); }
};

export const getBankDetails = async (req, res) => res.json(BANK_DETAILS);

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