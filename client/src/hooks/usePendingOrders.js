// src/hooks/usePendingOrders.js
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

export const usePendingOrders = () => {
  const user = useAuthStore(s => s.user);
  const { data } = useQuery({
    queryKey: ['admin-orders-count'],
    queryFn: ordersApi.getAll,
    enabled: user?.role === 'ADMIN',
    refetchInterval: 30000, // poll every 30s
    select: (orders) => orders.filter(o => o.status === 'PENDING').length
  });
  return data || 0;
};
