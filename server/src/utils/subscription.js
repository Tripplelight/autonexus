// src/utils/subscription.js
//
// SINGLE SOURCE OF TRUTH for dealer subscription state.
//
// The Dealer row stores `subscriptionStatus` (intent: TRIAL | ACTIVE | SUSPENDED)
// plus the dates `trialEndsAt` / `subscriptionEndsAt`. The *effective* state must
// always be DERIVED from those values + the current time — never read raw off the
// row, because the stored status drifts (a dealer can be stored ACTIVE while the
// end date has already passed). Every read path runs through computeSubscription()
// so the API, the cron, and all four frontend pages agree on one shape.
import { prisma } from '../config/db.js';

const DAY = 1000 * 60 * 60 * 24;

/**
 * Derive the canonical, effective subscription state for a dealer.
 * Pure — no DB, no side effects. This is THE shape every consumer trusts.
 *
 * @returns {{
 *   status: 'TRIAL'|'ACTIVE'|'EXPIRED'|'SUSPENDED', // effective status
 *   active: boolean,        // may the dealer list/manage cars & be publicly visible
 *   daysLeft: number,       // whole days until expiry (0 when expired/suspended)
 *   expiresAt: Date|null,   // the governing expiry date for the current phase
 *   trialEndsAt: Date|null,
 *   subscriptionEndsAt: Date|null,
 * }}
 */
export function computeSubscription(dealer, now = new Date()) {
  const trialEndsAt = dealer.trialEndsAt ?? null;
  const subscriptionEndsAt = dealer.subscriptionEndsAt ?? null;

  // SUSPENDED is admin-controlled and terminal — it never auto-derives.
  if (dealer.subscriptionStatus === 'SUSPENDED') {
    return {
      status: 'SUSPENDED', active: false, daysLeft: 0,
      expiresAt: subscriptionEndsAt, trialEndsAt, subscriptionEndsAt,
    };
  }

  // Pick the date that governs the current phase.
  const isTrialPhase = dealer.subscriptionStatus === 'TRIAL';
  const expiresAt = isTrialPhase ? trialEndsAt : subscriptionEndsAt;
  const phase = isTrialPhase ? 'TRIAL' : 'ACTIVE';

  // No governing date, or it's in the past → effectively expired.
  // (Every real activation sets an end date, so a missing date means a data
  // anomaly, which we resolve as EXPIRED rather than "active forever".)
  const expiryMs = expiresAt ? new Date(expiresAt).getTime() : null;
  if (expiryMs == null || expiryMs <= now.getTime()) {
    return {
      status: 'EXPIRED', active: false, daysLeft: 0,
      expiresAt, trialEndsAt, subscriptionEndsAt,
    };
  }

  return {
    status: phase,
    active: true,
    daysLeft: Math.ceil((expiryMs - now.getTime()) / DAY),
    expiresAt, trialEndsAt, subscriptionEndsAt,
  };
}

/**
 * Prisma `where` OR-clauses that mirror computeSubscription's `active === true`
 * rule, for list/visibility queries (e.g. hiding inactive dealers' cars from the
 * public marketplace). MUST stay in sync with computeSubscription above.
 *
 * Includes `dealerId: null` so house / platform listings (no dealer) always show.
 */
export function activeDealerVisibility(now = new Date()) {
  return [
    { dealerId: null },
    { dealer: { is: { subscriptionStatus: 'TRIAL', trialEndsAt: { gt: now } } } },
    { dealer: { is: { subscriptionStatus: 'ACTIVE', subscriptionEndsAt: { gt: now } } } },
  ];
}

/**
 * Compute the effective state AND lazily persist a drift to EXPIRED, so the stored
 * status stays truthful between nightly cron runs. Use on dealer-scoped reads where
 * a write is acceptable; list endpoints can call computeSubscription directly.
 */
export async function syncDealerStatus(dealer, now = new Date()) {
  const sub = computeSubscription(dealer, now);
  if (
    sub.status === 'EXPIRED' &&
    dealer.subscriptionStatus !== 'EXPIRED' &&
    dealer.subscriptionStatus !== 'SUSPENDED'
  ) {
    await prisma.dealer.update({
      where: { id: dealer.id },
      data: { subscriptionStatus: 'EXPIRED' },
    });
  }
  return sub;
}
