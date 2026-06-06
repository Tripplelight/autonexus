// server/src/controllers/mpesa.controller.js
import { prisma } from '../config/db.js';
import { stkPush, querySTKStatus } from '../services/mpesa.service.js';

const PLAN_PRICES = { 1: 5000, 3: 14000, 6: 26000, 12: 48000 };

// ── Initiate STK Push ─────────────────────────────────────────────────────────
export const initiateSubscriptionPayment = async (req, res, next) => {
  try {
    const { months = 1, phone } = req.body;
    const amount = PLAN_PRICES[months];
    if (!amount) return res.status(400).json({ message: 'Invalid plan selected' });
    if (!phone) return res.status(400).json({ message: 'M-Pesa number is required' });

    const dealer = await prisma.dealer.findUnique({
      where: { userId: req.user.id },
      include: { user: true }
    });
    if (!dealer) return res.status(404).json({ message: 'Dealer not found' });

    const subscription = await prisma.subscription.create({
      data: {
        dealerId: dealer.id,
        amount,
        status: 'PENDING',
        period: new Date().toISOString().slice(0, 7),
      }
    });

    const mpesaRes = await stkPush({
      phone,
      amount,
      orderId: subscription.id,
      carName: `AutoNexus ${months}-Month Subscription`
    });

    // Save checkout request ID for callback matching
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { mpesaRef: mpesaRes.CheckoutRequestID }
    });

    res.json({
      success: true,
      checkoutRequestId: mpesaRes.CheckoutRequestID,
      message: 'STK push sent to your phone. Enter your M-Pesa PIN to complete payment.',
      subscriptionId: subscription.id
    });
  } catch (err) { next(err); }
};

// ── Mpesa Callback (called by Safaricom) ─────────────────────────────────────
export const mpesaCallback = async (req, res) => {
  try {
    const { Body } = req.body;
    const { stkCallback } = Body;
    const { ResultCode, CheckoutRequestID, CallbackMetadata } = stkCallback;

    // Always respond 200 to Safaricom immediately
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });

    const subscription = await prisma.subscription.findFirst({
      where: { mpesaRef: CheckoutRequestID }
    });
    if (!subscription) return;

    // Payment failed
    if (ResultCode !== 0) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'FAILED' }
      });
      return;
    }

    // Payment successful — activate subscription
    const items = CallbackMetadata?.Item || [];
    const getMeta = (name) => items.find(i => i.Name === name)?.Value;
    const mpesaReceiptNumber = getMeta('MpesaReceiptNumber');
    const amount = getMeta('Amount');

    // Calculate months from amount
    const months = Object.entries(PLAN_PRICES).find(([, v]) => v === amount)?.[0] || 1;
    const subscriptionEndsAt = new Date();
    subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + parseInt(months));

    // Update subscription record
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'PAID', mpesaRef: mpesaReceiptNumber }
    });

    // Activate dealer
    await prisma.dealer.update({
      where: { id: subscription.dealerId },
      data: {
        subscriptionStatus: 'ACTIVE',
        subscriptionEndsAt
      }
    });

  } catch (err) {
    console.error('[MPESA CALLBACK ERROR]', err);
  }
};

// ── Check Payment Status (frontend polling) ───────────────────────────────────
export const checkPaymentStatus = async (req, res, next) => {
  try {
    const { checkoutRequestId } = req.params;

    const subscription = await prisma.subscription.findFirst({
      where: { mpesaRef: checkoutRequestId },
      include: { dealer: true }
    });

    if (!subscription) return res.status(404).json({ message: 'Payment not found' });

    // If still pending, query Safaricom directly
    if (subscription.status === 'PENDING') {
      try {
        const mpesaStatus = await querySTKStatus(checkoutRequestId);
        if (mpesaStatus.ResultCode === '0') {
          // Confirmed paid but callback may have been missed — activate manually
          const months = Object.entries(PLAN_PRICES).find(([, v]) => v === subscription.amount)?.[0] || 1;
          const subscriptionEndsAt = new Date();
          subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + parseInt(months));

          await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: 'PAID' }
          });

          await prisma.dealer.update({
            where: { id: subscription.dealerId },
            data: { subscriptionStatus: 'ACTIVE', subscriptionEndsAt }
          });

          return res.json({ status: 'PAID', message: 'Payment confirmed' });
        }
      } catch (_) {
        // Safaricom query failed — return current DB status
      }
    }

    res.json({ status: subscription.status });
  } catch (err) { next(err); }
};

// ── SUPER ADMIN: Manual activation (hybrid fallback) ─────────────────────────
export const manualActivate = async (req, res, next) => {
  try {
    const { dealerId, months = 1 } = req.body;
    const amount = PLAN_PRICES[months] || 5000;

    const subscriptionEndsAt = new Date();
    subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + parseInt(months));

    await prisma.dealer.update({
      where: { id: dealerId },
      data: { subscriptionStatus: 'ACTIVE', subscriptionEndsAt }
    });

    await prisma.subscription.create({
      data: {
        dealerId,
        amount,
        status: 'PAID',
        period: new Date().toISOString().slice(0, 7),
        mpesaRef: `MANUAL-${Date.now()}`
      }
    });

    res.json({ success: true, message: 'Subscription manually activated' });
  } catch (err) { next(err); }
};