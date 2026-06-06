// src/middleware/subscription.js
import { prisma } from '../config/db.js';
import { computeSubscription } from '../utils/subscription.js';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'];

/**
 * Gate dealer-only write actions (create/update/delete listings) on an ACTIVE or
 * TRIAL subscription. This is the backend enforcement that matches what the UI
 * shows — without it, an expired dealer could still mutate cars via the API even
 * though the frontend hides the buttons.
 *
 * Admins bypass entirely. On success, attaches `req.dealer` and `req.subscription`
 * (the canonical shape) so downstream handlers can reuse them without re-querying.
 */
export const requireActiveSubscription = async (req, res, next) => {
  try {
    if (ADMIN_ROLES.includes(req.user?.role)) return next();

    const dealer = await prisma.dealer.findUnique({ where: { userId: req.user.id } });
    if (!dealer) return res.status(404).json({ message: 'Dealer profile not found' });

    const subscription = computeSubscription(dealer);
    if (!subscription.active) {
      return res.status(403).json({
        message: 'Your subscription is not active. Renew to manage your listings.',
        subscription,
      });
    }

    req.dealer = dealer;
    req.subscription = subscription;
    next();
  } catch (err) { next(err); }
};
