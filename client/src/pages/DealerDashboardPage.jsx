// src/pages/DealerDashboardPage.jsx
import { useState, useRef } from 'react';
import { Plus, Car, Package, Clock, Calendar, CheckCircle, XCircle, ChevronRight, User, Phone, Mail } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import CarFormModal from '../components/cars/CarFormModal';
import DealerCarTable from '../components/dealer/DealerCarTable';
import SubscriptionBanner from '../components/dealer/SubscriptionBanner';
import ProfileCompletenessBar from '../components/dealer/ProfileCompletenessBar';
import { useSEO } from '../hooks/useSEO';

export default function DealerDashboardPage() {
  useSEO({ title: 'Dealer Dashboard' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const inquiriesRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['dealer-profile'],
    queryFn: () => api.get('/dealers/profile'),
  });

  const { data: subscription } = useQuery({
    queryKey: ['dealer-subscription'],
    queryFn: () => api.get('/dealers/subscription'),
  });

  const { data: cars = [], isLoading: carsLoading } = useQuery({
    queryKey: ['dealer-cars'],
    queryFn: () => api.get('/dealers/my-cars'),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['dealer-orders'],
    queryFn: () => api.get('/dealers/my-orders'),
  });

  const { mutate: actionOrder, isPending: isActioning } = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/orders/${id}/dealer-action`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dealer-orders'] }),
  });

  const canEdit = !!subscription?.active;
  const pendingOrders = orders.filter(o => o.status === 'PENDING');

  const scrollToInquiries = () => {
    inquiriesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openCreateModal = () => { setEditingCar(null); setIsModalOpen(true); };
  const openEditModal = (car) => { setEditingCar(car); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingCar(null); };

  const colorMap = {
    brand: 'bg-brand-500/10 text-brand-400',
    green: 'bg-green-500/10 text-green-400',
    blue: 'bg-blue-500/10 text-blue-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
  };

  const stats = [
    { label: 'Total Listings', value: cars.length, icon: Car, color: 'brand', onClick: null },
    { label: 'Active Listings', value: cars.filter(c => c.status === 'AVAILABLE').length, icon: Car, color: 'green', onClick: null },
    {
      label: 'Pending Inquiries',
      value: orders.length,
      icon: Package,
      color: 'blue',
      onClick: scrollToInquiries,
      badge: pendingOrders.length,
    },
    { label: 'Days Left', value: subscription?.daysLeft ?? '—', icon: Clock, color: 'yellow', onClick: null },
  ];

  const statusStyles = {
    PENDING: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    CONFIRMED: 'bg-green-500/10 text-green-400 border border-green-500/20',
    CANCELLED: 'bg-red-500/10 text-red-400 border border-red-500/20',
    COMPLETED: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  };

  const typeStyles = {
    INQUIRY: 'bg-white/5 text-white/50',
    DEPOSIT: 'bg-brand-500/10 text-brand-400',
    PURCHASE: 'bg-green-500/10 text-green-400',
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-white/40 text-xs sm:text-sm mb-1">Welcome back 👋</p>
            <h1 className="font-display text-2xl sm:text-3xl tracking-wider text-white leading-tight">
              {profile?.businessName?.toUpperCase() || 'DEALER DASHBOARD'}
            </h1>
            <p className="text-white/50 text-sm mt-1">Manage your inventory • Grow your business</p>
            {profile?.location && (
              <p className="text-white/30 text-xs sm:text-sm mt-1">{profile.location}</p>
            )}
          </div>

          {canEdit ? (
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                onClick={openCreateModal}
                className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 transition-all px-5 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-brand-500/25 active:scale-95"
              >
                <Plus size={18} /> ADD NEW CAR
              </button>
              <a
                href="/dealer/subscription"
                className="flex items-center justify-center gap-2 border border-white/20 hover:border-white/50 transition-all px-4 py-3 rounded-xl text-sm font-medium"
              >
                <Calendar size={16} /> Subscription
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm px-4 py-3 rounded-xl self-start sm:self-auto">
              Subscription inactive — contact admin to renew
            </div>
          )}
        </div>

        {/* Profile Completeness Bar */}
        <ProfileCompletenessBar profile={profile} />

        {/* Subscription Banner */}
        <SubscriptionBanner subscription={subscription} />

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {stats.map((s, i) => (
            <div
              key={i}
              onClick={s.onClick}
              className={`bg-dark-800 border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center gap-3 transition-colors relative
                ${s.onClick ? 'cursor-pointer hover:border-brand-500/40 hover:bg-dark-700' : 'hover:border-white/10'}`}
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${colorMap[s.color]}`}>
                <s.icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-white tabular-nums">{s.value}</p>
                <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
              </div>
              {/* Pending badge */}
              {s.badge > 0 && (
                <span className="absolute top-3 right-3 bg-brand-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {s.badge}
                </span>
              )}
              {s.onClick && (
                <ChevronRight size={14} className="text-white/20 shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* ── Inventory Table ── */}
        <div className="bg-dark-800 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors mb-6">
          <div className="px-5 sm:px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-semibold text-sm sm:text-base flex items-center gap-2">
              <Car size={16} className="text-brand-400" /> My Inventory
            </h2>
            <span className="text-xs text-white/30">{cars.length} vehicles</span>
          </div>
          <DealerCarTable
            cars={cars}
            onEdit={openEditModal}
            isLoading={carsLoading}
            canEdit={canEdit}
          />
        </div>

        {/* ── Inquiries Section ── */}
        <div ref={inquiriesRef} className="bg-dark-800 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors scroll-mt-6">
          <div className="px-5 sm:px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-semibold text-sm sm:text-base flex items-center gap-2">
              <Package size={16} className="text-blue-400" /> Inquiries & Orders
            </h2>
            <div className="flex items-center gap-2">
              {pendingOrders.length > 0 && (
                <span className="bg-brand-500/10 text-brand-400 text-xs px-2 py-0.5 rounded-full border border-brand-500/20">
                  {pendingOrders.length} pending
                </span>
              )}
              <span className="text-xs text-white/30">{orders.length} total</span>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Package size={32} className="text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No inquiries yet</p>
              <p className="text-white/20 text-xs mt-1">When buyers contact you, they'll appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors
                    ${order.status === 'PENDING' ? 'hover:bg-white/[0.02]' : 'opacity-60'}`}
                >
                  {/* Car + Buyer info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-medium text-white truncate">
                        {order.car?.year} {order.car?.make} {order.car?.model}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeStyles[order.type]}`}>
                        {order.type}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-white/40">
                      {order.user?.name && (
                        <span className="flex items-center gap-1">
                          <User size={10} /> {order.user.name}
                        </span>
                      )}
                      {order.user?.email && (
                        <span className="flex items-center gap-1">
                          <Mail size={10} /> {order.user.email}
                        </span>
                      )}
                      {order.user?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={10} /> {order.user.phone}
                        </span>
                      )}
                    </div>
                    {order.notes && (
                      <p className="text-xs text-white/30 mt-1 italic">"{order.notes}"</p>
                    )}
                    <p className="text-xs text-white/20 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-white">
                      KES {order.amount?.toLocaleString()}
                    </p>
                  </div>

                  {/* Status + Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[order.status]}`}>
                      {order.status}
                    </span>

                    {order.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => actionOrder({ id: order.id, status: 'CONFIRMED' })}
                          disabled={isActioning}
                          title="Confirm"
                          className="w-8 h-8 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                          <CheckCircle size={15} />
                        </button>
                        <button
                          onClick={() => actionOrder({ id: order.id, status: 'CANCELLED' })}
                          disabled={isActioning}
                          title="Cancel"
                          className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                          <XCircle size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Modal ── */}
      <CarFormModal
        car={editingCar}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={closeModal}
      />
    </div>
  );
}