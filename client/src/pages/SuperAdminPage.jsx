// src/pages/SuperAdminPage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Car, Package, BarChart3, CheckCircle, XCircle, AlertTriangle, Shield } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import api from '../services/api';
import { ordersApi } from '../services/api';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'dealers', label: 'Dealers', icon: Users },
  { id: 'orders', label: 'All Orders', icon: Package },
];

const subStatusColor = {
  TRIAL: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
  ACTIVE: 'text-green-400 bg-green-500/10 border-green-500/20',
  EXPIRED: 'text-red-400 bg-red-500/10 border-red-500/20',
  SUSPENDED: 'text-red-400 bg-red-500/10 border-red-500/20'
};

const orderStatusColor = {
  PENDING: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  CONFIRMED: 'text-green-400 bg-green-500/10 border-green-500/20',
  CANCELLED: 'text-red-400 bg-red-500/10 border-red-500/20',
  COMPLETED: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
};

export default function SuperAdminPage() {
  useSEO({ title: 'Super Admin' });
  const [tab, setTab] = useState('overview');
  const [activatingDealer, setActivatingDealer] = useState(null);
  const [months, setMonths] = useState(1);
  const qc = useQueryClient();

  const { data: dealers } = useQuery({
    queryKey: ['all-dealers'],
    queryFn: () => api.get('/dealers').then(r => r.data)
  });

  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: ordersApi.getAll
  });

  const { mutate: updateSubscription, isPending: updatingSub } = useMutation({
    mutationFn: ({ dealerId, status, months }) =>
      api.patch(`/dealers/${dealerId}/subscription`, { status, months }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['all-dealers'] });
      setActivatingDealer(null);
    }
  });

  const { mutate: suspendDealer } = useMutation({
    mutationFn: (dealerId) => api.patch(`/dealers/${dealerId}/suspend`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['all-dealers'] })
  });

  const { mutate: updateOrderStatus } = useMutation({
    mutationFn: ({ id, status }) => ordersApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] })
  });

  const activeCount = dealers?.filter(d => d.subscriptionStatus === 'ACTIVE').length || 0;
  const trialCount = dealers?.filter(d => d.subscriptionStatus === 'TRIAL').length || 0;
  const expiredCount = dealers?.filter(d => ['EXPIRED', 'SUSPENDED'].includes(d.subscriptionStatus)).length || 0;
  const monthlyRevenue = activeCount * 5000;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Activate Modal */}
      {activatingDealer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm bg-dark-800 border border-white/10 rounded-2xl p-6">
            <h3 className="font-semibold mb-1">Activate Subscription</h3>
            <p className="text-sm text-white/40 mb-5">{activatingDealer.businessName}</p>
            <div className="mb-4">
              <label className="text-xs text-white/40 mb-1.5 block">Months</label>
              <select value={months} onChange={e => setMonths(parseInt(e.target.value))}
                className="input w-full">
                {[1,2,3,6,12].map(m => (
                  <option key={m} value={m}>{m} month{m > 1 ? 's' : ''} — KES {(m * 5000).toLocaleString()}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setActivatingDealer(null)} className="btn-outline flex-1">Cancel</button>
              <button
                onClick={() => updateSubscription({ dealerId: activatingDealer.id, status: 'ACTIVE', months })}
                disabled={updatingSub}
                className="btn-primary flex-1">
                {updatingSub ? 'Activating...' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
          <Shield size={20} />
        </div>
        <div>
          <h1 className="font-display text-4xl tracking-wider">SUPER ADMIN</h1>
          <p className="text-white/40 text-sm">AutoNexus Platform Control</p>
        </div>
      </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Dealers', value: dealers?.length || 0, color: 'brand', icon: Users },
              { label: 'Active Subscriptions', value: activeCount, color: 'green', icon: CheckCircle },
              { label: 'On Trial', value: trialCount, color: 'yellow', icon: AlertTriangle },
              { label: 'Monthly Revenue', value: `KES ${monthlyRevenue.toLocaleString()}`, color: 'blue', icon: BarChart3 }
            ].map((s, i) => (
              <div key={i} className="card p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  s.color === 'brand' ? 'bg-brand-500/10 text-brand-400' :
                  s.color === 'green' ? 'bg-green-500/10 text-green-400' :
                  s.color === 'yellow' ? 'bg-yellow-500/10 text-yellow-400' :
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  <s.icon size={22} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-white/40">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Expiring soon */}
          <div className="card">
            <div className="p-5 border-b border-white/5">
              <h3 className="font-semibold flex items-center gap-2"><AlertTriangle size={15} className="text-yellow-400" /> Needs Attention</h3>
            </div>
            <div className="divide-y divide-white/5">
              {dealers?.filter(d => ['EXPIRED', 'SUSPENDED'].includes(d.subscriptionStatus)).length === 0
                ? <p className="p-6 text-white/30 text-sm text-center">All dealers are active 🎉</p>
                : dealers?.filter(d => ['EXPIRED', 'SUSPENDED'].includes(d.subscriptionStatus)).map(d => (
                  <div key={d.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{d.businessName}</p>
                      <p className="text-xs text-white/30">{d.user?.email}</p>
                    </div>
                    <span className={`badge border text-xs ${subStatusColor[d.subscriptionStatus]}`}>{d.subscriptionStatus}</span>
                    <button onClick={() => setActivatingDealer(d)} className="btn-primary !px-3 !py-1.5 !text-xs">Renew</button>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* Dealers */}
      {tab === 'dealers' && (
        <div className="card divide-y divide-white/5">
          {!dealers?.length ? <p className="p-6 text-white/30 text-sm text-center">No dealers yet</p>
            : dealers.map(d => (
              <div key={d.id} className="flex items-center gap-4 px-5 py-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{d.businessName}</p>
                  <p className="text-xs text-white/30">{d.user?.name} · {d.user?.email} · {d.location}</p>
                  <p className="text-xs text-white/20 mt-0.5">
                    {d._count?.cars} cars · {d._count?.orders} orders · Joined {new Date(d.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className={`badge border text-xs shrink-0 ${subStatusColor[d.subscriptionStatus]}`}>{d.subscriptionStatus}</span>
                <div className="flex gap-1 shrink-0">
                  {d.subscriptionStatus !== 'ACTIVE' && (
                    <button onClick={() => setActivatingDealer(d)}
                      className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors" title="Activate">
                      <CheckCircle size={15} />
                    </button>
                  )}
                  {d.subscriptionStatus !== 'SUSPENDED' && (
                    <button onClick={() => { if (confirm('Suspend this dealer?')) suspendDealer(d.id); }}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Suspend">
                      <XCircle size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Orders */}
      {tab === 'orders' && (
        <div className="card divide-y divide-white/5">
          {!orders?.length ? <p className="p-12 text-white/30 text-sm text-center">No orders yet</p>
            : orders.map(o => (
              <div key={o.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{o.car?.year} {o.car?.make} {o.car?.model}</p>
                  <p className="text-xs text-white/30">{o.user?.name} · {o.user?.email} · {o.type}</p>
                </div>
                <p className="text-sm text-brand-400 font-semibold shrink-0 hidden sm:block">KES {o.amount?.toLocaleString()}</p>
                <span className={`badge border text-xs shrink-0 ${orderStatusColor[o.status]}`}>{o.status}</span>
                {o.status === 'PENDING' && (
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => updateOrderStatus({ id: o.id, status: 'CONFIRMED' })}
                      className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg"><CheckCircle size={15} /></button>
                    <button onClick={() => updateOrderStatus({ id: o.id, status: 'CANCELLED' })}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><XCircle size={15} /></button>
                  </div>
                )}
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}