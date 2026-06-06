// src/pages/DealerDashboardPage.jsx
import { useState } from 'react';
import { Plus, Car, Package, Clock, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
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

  // Trust the backend's single source of truth — `active` is THE permission flag.
  const canEdit = !!subscription?.active;

  const openCreateModal = () => {
    setEditingCar(null);
    setIsModalOpen(true);
  };

  const openEditModal = (car) => {
    setEditingCar(car);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCar(null);
  };

  const stats = [
    { label: 'Total Listings', value: cars.length, icon: Car, color: 'brand' },
    { label: 'Active Listings', value: cars.filter(c => c.status === 'AVAILABLE').length, icon: Car, color: 'green' },
    { label: 'Total Inquiries', value: orders.length, icon: Package, color: 'blue' },
    { label: 'Days Left', value: subscription?.daysLeft ?? '—', icon: Clock, color: 'yellow' },
  ];

  const colorMap = {
    brand: 'bg-brand-500/10 text-brand-400',
    green: 'bg-green-500/10 text-green-400',
    blue: 'bg-blue-500/10 text-blue-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
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
            <p className="text-white/50 text-sm mt-1">
              Manage your inventory • Grow your business
            </p>
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
                <Plus size={18} />
                ADD NEW CAR
              </button>

              <a
                href="/dealer/subscription"
                className="flex items-center justify-center gap-2 border border-white/20 hover:border-white/50 transition-all px-4 py-3 rounded-xl text-sm font-medium"
              >
                <Calendar size={16} />
                Subscription
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
        
        {/* ── Subscription Banner ── */}
        <SubscriptionBanner subscription={subscription} />

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {stats.map((s, i) => (
            <div
              key={i}
              className="bg-dark-800 border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center gap-3 hover:border-white/10 transition-colors"
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${colorMap[s.color]}`}>
                <s.icon size={20} />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white tabular-nums">{s.value}</p>
                <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Inventory Table ── */}
        <div className="bg-dark-800 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors">
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