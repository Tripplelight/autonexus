// src/services/api.js
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api' });
const multipartConfig = { headers: { 'Content-Type': 'multipart/form-data' } };
const uploadConfig = (data) =>
  typeof FormData !== 'undefined' && data instanceof FormData ? multipartConfig : undefined;

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response?.status === 401) useAuthStore.getState().logout();
    return Promise.reject(err.response?.data || err);
  }
);

// Cars
export const carsApi = {
  getAll: (params) => api.get('/cars', { params }),
  getById: (id) => api.get(`/cars/${id}`),
  create: (data) => api.post('/cars', data, uploadConfig(data)),
  update: (id, data) => api.put(`/cars/${id}`, data, uploadConfig(data)),
  delete: (id) => api.delete(`/cars/${id}`),
  toggleFavorite: (carId) => api.post(`/cars/${carId}/favorite`),
  getFavorites: () => api.get('/cars/favorites')
};

// Auth
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// Orders
export const ordersApi = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  getAll: () => api.get('/orders'),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  checkPaymentStatus: (checkoutRequestId) => api.get(`/orders/mpesa/status/${checkoutRequestId}`),
  getBankDetails: () => api.get('/orders/bank-details')
};

// AI
export const aiApi = {
  chat: (data) => api.post('/ai/chat', data),
  predictPrice: (data) => api.post('/ai/price-predict', data),
  smartSearch: (query) => api.post('/ai/smart-search', { query }),
  testDrive: (carId, data) => api.post(`/ai/test-drive/${carId}`, data)
};

// Dealers
export const dealerApi = {
  register: (data) => api.post('/dealers/register', data),
  getProfile: () => api.get('/dealers/profile'),
  updateProfile: (data) => api.patch('/dealers/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyCars: () => api.get('/dealers/my-cars'),
  getMyOrders: () => api.get('/dealers/my-orders'),
  getSubscription: () => api.get('/dealers/subscription'),
  renewSubscription: (data) => api.patch('/dealers/subscription', data),
  getAllPayments: () => api.get('/dealers/payments/all').then(r => r.data),
  // Super admin
  getAll: () => api.get('/dealers'),
  updateSubscription: (dealerId, data) => api.patch(`/dealers/${dealerId}/subscription`, data),
  suspend: (dealerId) => api.patch(`/dealers/${dealerId}/suspend`)
};

export default api;
