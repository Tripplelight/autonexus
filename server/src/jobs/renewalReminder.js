// server/src/jobs/renewalReminder.js
import { prisma } from '../config/db.js';
import { computeSubscription } from '../utils/subscription.js';
import {
  sendSubscriptionRenewalReminder,
  sendSubscriptionExpiredEmail
} from '../services/email.service.js';

export const runRenewalReminders = async () => {
  console.log('[CRON] Running renewal reminders...');

  // Walk every dealer still in a live phase; computeSubscription is the single
  // source of truth for whether they've actually expired and how long is left.
  const dealers = await prisma.dealer.findMany({
    where: { subscriptionStatus: { in: ['TRIAL', 'ACTIVE'] } },
    include: { user: { select: { name: true, email: true } } }
  });

  for (const dealer of dealers) {
    const sub = computeSubscription(dealer);

    // Just lapsed (trial or paid) — persist EXPIRED and notify once.
    if (!sub.active) {
      await prisma.dealer.update({
        where: { id: dealer.id },
        data: { subscriptionStatus: 'EXPIRED' }
      });
      await sendSubscriptionExpiredEmail({ dealer }).catch(console.error);
      console.log(`[CRON] Expired: ${dealer.businessName}`);
      continue;
    }

    // Renewal nudge for paid subscriptions nearing their end date.
    if (sub.status === 'ACTIVE' && [7, 3, 1].includes(sub.daysLeft)) {
      await sendSubscriptionRenewalReminder({ dealer, daysLeft: sub.daysLeft }).catch(console.error);
      console.log(`[CRON] Reminder sent to ${dealer.user.email} — ${sub.daysLeft} days left`);
    }
  }

  console.log('[CRON] Renewal reminders done.');
};