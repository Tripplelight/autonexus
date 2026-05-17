// src/pages/AccountPage.jsx
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Package, Clock } from 'lucide-react';

const statusColor = { PENDING: 'text-yellow-400 bg-yellow-500/10', CONFIRMED: 'text-green-400 bg-green-500/10', CANCELLED: 'text-red-400 bg-red-500/10', COMPLETED: 'text-blue-400 bg-blue-500/10' };

export default function AccountPage() {
  const { user } = useAuthStore();
  const { data: orders, isLoading } = useQuery({ queryKey: ['my-orders'], queryFn: ordersApi.getMyOrders });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-4xl tracking-wider mb-2">MY ACCOUNT</h1>
      <p className="text-white/40 text-sm mb-8">Welcome back, {user?.name}</p>

      <div className="card p-6 mb-6">
        <h3 className="font-semibold mb-4">Profile</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-white/40 text-xs mb-1">Name</p><p>{user?.name}</p></div>
          <div><p className="text-white/40 text-xs mb-1">Email</p><p>{user?.email}</p></div>
          <div><p className="text-white/40 text-xs mb-1">Role</p><p className="capitalize">{user?.role?.toLowerCase()}</p></div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Package size={16} className="text-brand-400" /> My Orders</h3>
        {isLoading ? <p className="text-white/30 text-sm">Loading orders...</p> :
          !orders?.length ? <p className="text-white/30 text-sm">No orders yet. <a href="/cars" className="text-brand-400 hover:underline">Browse cars</a></p> :
          <div className="space-y-3">
            {orders.map(o => (
              <div key={o.id} className="flex items-center gap-4 p-4 bg-dark-700 rounded-xl">
                <div className="w-16 h-12 bg-dark-600 rounded-lg overflow-hidden">
                  {o.car?.images?.[0] && <img src={o.car.images[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{o.car?.year} {o.car?.make} {o.car?.model}</p>
                  <p className="text-xs text-white/40">{o.type} · KES {o.amount?.toLocaleString()}</p>
                </div>
                <span className={`badge text-xs ${statusColor[o.status]}`}>{o.status}</span>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
}
