// src/pages/DealerDashboardPage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Car, Package, BarChart3, Plus, Pencil, Trash2, Eye, Star, StarOff, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { carsApi, ordersApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useSEO } from '../hooks/useSEO';
import api from '../services/api';
import CarFormModal from '../components/cars/CarFormModal';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'cars', label: 'My Cars', icon: Car },
  { id: 'orders', label: 'Inquiries', icon: Package },
];

const statusColor = {
  PENDING: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  CONFIRMED: 'text-green-400 bg-green-500/10 border-green-500/20',
  CANCELLED: 'text-red-400 bg-red-500/10 border-red-500/20',
  COMPLETED: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
};

const subStatusColor = {
  TRIAL: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
  ACTIVE: 'text-green-400 bg-green-500/10 border-green-500/20',
  EXPIRED: 'text-red-400 bg-red-500/10 border-red-500/20',
  SUSPENDED: 'text-red-400 bg-red-500/10 border-red-500/20'
};

export default function DealerDashboardPage() {
  useSEO({ title: 'Dealer Dashboard' });
  const [tab, setTab] = useState('overview');
  const [showCarForm, setShowCarForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['dealer-profile'],
    queryFn: () => api.get('/dealers/profile').then(r => r.data)
  });

  const { data: subscription } = useQuery({
    queryKey: ['dealer-subscription'],
    queryFn: () => api.get('/dealers/subscription').then(r => r.data)
  });

  const { data: cars, isLoading: carsLoading } = useQuery({
    queryKey: ['dealer-cars'],
    queryFn: () => api.get('/dealers/my-cars').then(r => r.data)
  });

  const { data: orders } = useQuery({
    queryKey: ['dealer-orders'],
    queryFn: () => api.get('/dealers/my-orders').then(r => r.data)
  });

  const { mutate: deleteCar } = useMutation({
    mutationFn: (id) => carsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dealer-cars'] })
  });

  const { mutate: toggleFeatured } = useMutation({
    mutationFn: ({ id, featured, existingImages }) => {
      const fd = new FormData();
      fd.append('featured', !featured);
      fd.append('existingImages', JSON.stringify(existingImages || []));
      return carsApi.update(id, fd);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dealer-cars'] })
  });

  const canAddCars = subscription?.status === 'TRIAL' || subscription?.status === 'ACTIVE';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-white/30 text-sm mb-1">Welcome back 👋</p>
          <h1 className="font-display text-4xl tracking-wider">{profile?.businessName || 'DEALER DASHBOARD'}</h1>
          <p className="text-white/40 text-sm mt-1 flex items-center gap-2">
            {profile?.location}
            {subscription && (
              <span className={`badge border text-xs ${subStatusColor[subscription.status]}`}>
                {subscription.status} {subscription.daysLeft > 0 ? `· ${subscription.daysLeft}d left` : ''}
              </span>
            )}
          </p>
        </div>
        {canAddCars ? (
          <button onClick={() => setShowCarForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Car
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2.5 rounded-xl">
            <AlertTriangle size={15} /> Subscription expired — contact admin to renew
          </div>
        )}
      </div>

      {/* Modals */}
      {(showCarForm || editingCar) && (
        <CarFormModal
          car={editingCar}
          onClose={() => { setShowCarForm(false); setEditingCar(null); }}
          onSuccess={() => qc.invalidateQueries({ queryKey: ['dealer-cars'] })}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-800 border border-white/5 rounded-xl p-1 w-fit mb-8">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === id ? 'bg-brand-500 text-white' : 'text-white/40 hover:text-white'}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Listings', value: cars?.length || 0, icon: Car, color: 'brand' },
              { label: 'Total Inquiries', value: orders?.length || 0, icon: Package, color: 'blue' },
              { label: 'Pending Inquiries', value: orders?.filter(o => o.status === 'PENDING').length || 0, icon: Clock, color: 'yellow' }
            ].map((s, i) => (
              <div key={i} className="card p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.color === 'brand' ? 'bg-brand-500/10 text-brand-400' : s.color === 'blue' ? 'bg-blue-500/10 text-blue-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                  <s.icon size={22} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-white/40">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Subscription info */}
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Subscription</h3>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-white/40">Status</p>
                <span className={`badge border text-sm mt-1 ${subStatusColor[subscription?.status || 'TRIAL']}`}>
                  {subscription?.status || 'TRIAL'}
                </span>
              </div>
              <div>
                <p className="text-sm text-white/40">Days Remaining</p>
                <p className="text-2xl font-bold text-brand-400">{subscription?.daysLeft || 0}</p>
              </div>
              <div>
                <p className="text-sm text-white/40">Monthly Fee</p>
                <p className="text-lg font-semibold">KES 5,000</p>
              </div>
              <div className="text-sm text-white/40">
                <p>To renew your subscription,</p>
                <p>contact <span className="text-brand-400">admin@autonexus.com</span></p>
              </div>
            </div>
          </div>

          {/* Recent orders */}
          <div className="card">
            <div className="p-5 border-b border-white/5">
              <h3 className="font-semibold">Recent Inquiries</h3>
            </div>
            <div className="divide-y divide-white/5">
              {!orders?.length ? <p className="p-6 text-white/30 text-sm text-center">No inquiries yet</p>
                : orders.slice(0, 5).map(o => (
                  <div key={o.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{o.car?.year} {o.car?.make} {o.car?.model}</p>
                      <p className="text-xs text-white/30">{o.user?.name} · {o.user?.phone || o.user?.email}</p>
                    </div>
                    <p className="text-sm text-brand-400 font-medium shrink-0">KES {o.amount?.toLocaleString()}</p>
                    <span className={`badge border text-xs ${statusColor[o.status]}`}>{o.status}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* Cars */}
      {tab === 'cars' && (
        <div className="card divide-y divide-white/5">
          {carsLoading ? <p className="p-6 text-white/30 text-sm text-center">Loading...</p>
            : !cars?.length ? (
              <div className="p-12 text-center">
                <Car size={40} className="text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm">No cars yet</p>
                {canAddCars && <button onClick={() => setShowCarForm(true)} className="btn-primary !px-5 !py-2 !text-sm mt-4">Add First Car</button>}
              </div>
            ) : cars.map(car => (
              <div key={car.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors">
                <div className="w-16 h-12 bg-dark-700 rounded-xl overflow-hidden shrink-0 border border-white/5">
                  {car.images?.[0] ? <img src={car.images[0]} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Car size={16} className="text-white/10" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{car.year} {car.make} {car.model}</p>
                  <p className="text-xs text-white/30">{car.bodyType} · {car.fuel} · {car.mileage?.toLocaleString()} km</p>
                </div>
                <p className="text-brand-400 font-semibold text-sm shrink-0 hidden sm:block">KES {car.price?.toLocaleString()}</p>
                <div className="flex items-center gap-1 shrink-0">
                  <Link to={`/cars/${car.id}`} target="_blank"
                    className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <Eye size={14} />
                  </Link>
                  <button onClick={() => toggleFeatured({ id: car.id, featured: car.featured, existingImages: car.images })}
                    className={`p-2 rounded-lg transition-colors ${car.featured ? 'text-brand-400 hover:bg-brand-500/10' : 'text-white/30 hover:text-white hover:bg-white/5'}`}>
                    {car.featured ? <Star size={14} /> : <StarOff size={14} />}
                  </button>
                  <button onClick={() => setEditingCar(car)}
                    className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => { if (confirm('Delete this car?')) deleteCar(car.id); }}
                    className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Orders */}
      {tab === 'orders' && (
        <div className="card divide-y divide-white/5">
          {!orders?.length ? <p className="p-12 text-white/30 text-sm text-center">No inquiries yet</p>
            : orders.map(o => (
              <div key={o.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{o.car?.year} {o.car?.make} {o.car?.model}</p>
                  <p className="text-xs text-white/30">{o.user?.name} · {o.user?.phone || o.user?.email} · {o.type}</p>
                  <p className="text-xs text-white/20">{new Date(o.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <p className="text-sm text-brand-400 font-semibold shrink-0 hidden sm:block">KES {o.amount?.toLocaleString()}</p>
                <span className={`badge border text-xs shrink-0 ${statusColor[o.status]}`}>{o.status}</span>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}