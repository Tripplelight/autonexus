// src/pages/AccountPage.jsx
import { useQuery } from '@tanstack/react-query';
import { Navigate, Link } from 'react-router-dom';
import { ordersApi, dealerApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Package, Car, Clock, Calendar, Settings, Shield } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

const statusColor = {
  PENDING: 'text-yellow-400 bg-yellow-500/10',
  CONFIRMED: 'text-green-400 bg-green-500/10',
  CANCELLED: 'text-red-400 bg-red-500/10',
  COMPLETED: 'text-blue-400 bg-blue-500/10',
};

// ── User Account ──────────────────────────────────────────────
function UserAccount({ user }) {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: ordersApi.getMyOrders,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <p className="text-white/40 text-xs mb-1">Welcome back 👋</p>
      <h1 className="font-display text-2xl sm:text-3xl tracking-wider mb-6">MY ACCOUNT</h1>

      {/* Profile */}
      <div className="bg-dark-800 border border-white/5 rounded-2xl p-5 mb-4">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <Settings size={14} className="text-brand-400" /> Profile
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/40 text-xs mb-1">Name</p>
            <p>{user?.name}</p>
          </div>
          <div>
            <p className="text-white/40 text-xs mb-1">Email</p>
            <p className="truncate">{user?.email}</p>
          </div>
          <div>
            <p className="text-white/40 text-xs mb-1">Role</p>
            <p className="capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="bg-dark-800 border border-white/5 rounded-2xl p-5">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <Package size={14} className="text-brand-400" /> My Orders
        </h3>
        {isLoading ? (
          <p className="text-white/30 text-sm">Loading orders...</p>
        ) : !orders?.length ? (
          <p className="text-white/30 text-sm">
            No orders yet.{' '}
            <Link to="/cars" className="text-brand-400 hover:underline">Browse cars</Link>
          </p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center gap-3 p-3 bg-dark-700 rounded-xl">
                <div className="w-14 h-10 bg-dark-600 rounded-lg overflow-hidden shrink-0">
                  {o.car?.images?.[0] && (
                    <img src={o.car.images[0]} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {o.car?.year} {o.car?.make} {o.car?.model}
                  </p>
                  <p className="text-xs text-white/40">{o.type} · KES {o.amount?.toLocaleString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg font-medium shrink-0 ${statusColor[o.status]}`}>
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Dealer Account ────────────────────────────────────────────
function DealerAccount({ user }) {
  const { data: profile } = useQuery({
    queryKey: ['dealer-profile'],
    queryFn: dealerApi.getProfile,
  });

  const { data: subscription } = useQuery({
    queryKey: ['dealer-subscription'],
    queryFn: dealerApi.getSubscription,
  });

  const { data: cars = [] } = useQuery({
    queryKey: ['dealer-cars'],
    queryFn: dealerApi.getMyCars,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['dealer-orders'],
    queryFn: dealerApi.getMyOrders,
  });

  const isActive = ['TRIAL', 'ACTIVE'].includes(subscription?.status);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <p className="text-white/40 text-xs mb-1">Welcome back 👋</p>
      <h1 className="font-display text-2xl sm:text-3xl tracking-wider mb-1">
        {profile?.businessName?.toUpperCase() || 'MY ACCOUNT'}
      </h1>
      <p className="text-white/40 text-xs mb-6">{profile?.location || user?.email}</p>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Listings', value: cars.length, icon: Car, color: 'text-brand-400' },
          { label: 'Inquiries', value: orders.length, icon: Package, color: 'text-blue-400' },
          ...(import.meta.env.VITE_SUBSCRIPTIONS_ENABLED === 'true'
            ? [{ label: 'Days Left', value: subscription?.daysLeft ?? '—', icon: Clock, color: 'text-yellow-400' }]
            : []),
        ].map((s, i) => (
          <div key={i} className="bg-dark-800 border border-white/5 rounded-2xl p-4 text-center">
            <s.icon size={16} className={`mx-auto mb-2 ${s.color}`} />
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Business Profile */}
      <div className="bg-dark-800 border border-white/5 rounded-2xl p-5 mb-4">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <Settings size={14} className="text-brand-400" /> Business Profile
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/40 text-xs mb-1">Business Name</p>
            <p>{profile?.businessName || '—'}</p>
          </div>
          <div>
            <p className="text-white/40 text-xs mb-1">Email</p>
            <p className="truncate">{user?.email}</p>
          </div>
          <div>
            <p className="text-white/40 text-xs mb-1">Location</p>
            <p>{profile?.location || '—'}</p>
          </div>
          <div>
            <p className="text-white/40 text-xs mb-1">Phone</p>
            <p>{profile?.phone || '—'}</p>
          </div>
        </div>
      </div>

      {/* Subscription Status */}
      {import.meta.env.VITE_SUBSCRIPTIONS_ENABLED === 'true' && (
      <div className="bg-dark-800 border border-white/5 rounded-2xl p-5 mb-4">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <Calendar size={14} className="text-brand-400" /> Subscription
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/40 text-xs mb-1">Current Plan</p>
            <p className={`text-lg font-semibold capitalize ${isActive ? 'text-emerald-400' : 'text-red-400'}`}>
              {subscription?.status?.toLowerCase() || 'inactive'}
            </p>
          </div>
          <Link
            to="/dealer/subscription"
            className="text-xs bg-brand-500 hover:bg-brand-600 px-4 py-2 rounded-xl font-medium transition-colors"
          >
            {isActive ? 'Manage Plan' : 'Renew Now'}
          </Link>
        </div>
      </div>
      )}
      {/* Quick Links */}
      <div className="flex gap-3">
        <Link
          to="/dealer/dashboard"
          className="flex-1 text-center text-sm border border-white/10 hover:border-white/30 py-3 rounded-xl transition-colors"
        >
          Go to Dashboard
        </Link>
        {import.meta.env.VITE_SUBSCRIPTIONS_ENABLED === 'true' && (
        <Link
          to="/dealer/subscription"
          className="flex-1 text-center text-sm border border-white/10 hover:border-white/30 py-3 rounded-xl transition-colors"
        >
          Subscription
        </Link>
)}
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────
export default function AccountPage() {
  useSEO({ title: 'My Account' });
  const { user } = useAuthStore();

  if (user?.role === 'SUPER_ADMIN') return <Navigate to="/admin" replace />;
  if (user?.role === 'DEALER') return <DealerAccount user={user} />;
  return <UserAccount user={user} />;
}