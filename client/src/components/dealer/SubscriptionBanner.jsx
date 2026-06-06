// client/src/components/dealer/SubscriptionBanner.jsx
import { AlertTriangle, Clock, XCircle } from 'lucide-react';

const BANNER_CONFIG = {
  TRIAL: {
    icon: Clock,
    color: 'amber',
    title: 'Free trial ending soon',
    message: 'Your 30-day free trial is ending soon. Subscribe to keep your inventory visible to buyers.',
  },
  EXPIRED: {
    icon: AlertTriangle,
    color: 'red',
    title: 'Subscription expired',
    message: 'Your subscription has expired. Your listings are currently hidden from the marketplace.',
  },
  SUSPENDED: {
    icon: XCircle,
    color: 'red',
    title: 'Account suspended',
    message: 'Your account has been suspended. Please contact support to resolve this issue.',
  },
};

export default function SubscriptionBanner({ subscription }) {
  if (!subscription) return null;

  const { status, daysLeft, active } = subscription;

  // Healthy paid subscription — nothing to warn about.
  if (active && status === 'ACTIVE') return null;
  // Trial still has comfortable runway — only warn in the last 7 days.
  if (status === 'TRIAL' && daysLeft > 7) return null;

  const config = BANNER_CONFIG[status];
  if (!config) return null; // Unknown status — show nothing. Shouldn't happen.

  

  const { icon: Icon, color, title, message } = config;

  const colorMap = {
    amber: {
      wrapper: 'from-amber-500/10 to-yellow-500/10 border-amber-500/30',
      icon: 'text-amber-400',
      btn: 'bg-amber-500 hover:bg-amber-600',
    },
    red: {
      wrapper: 'from-red-500/10 to-rose-500/10 border-red-500/30',
      icon: 'text-red-400',
      btn: 'bg-red-500 hover:bg-red-600',
    },
  };

  const c = colorMap[color];

  return (
    <div className={`mb-8 bg-gradient-to-r ${c.wrapper} border rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5`}>
      <div className={`shrink-0 ${c.icon}`}>
        <Icon size={26} />
      </div>

      <div className="flex-1">
        <p className={`font-semibold ${c.icon} mb-1`}>{title}</p>
        <p className="text-white/60 text-sm leading-relaxed">{message}</p>
      </div>

      {/* No redirect to non-existent route — just show contact info */}
      <div className="shrink-0 text-sm text-white/50 whitespace-nowrap">
        Contact <span className="text-brand-400 font-medium">admin@autonexus.com</span>
      </div>
    </div>
  );
}