// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';

import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import CarsPage from './pages/CarsPage';
import CarDetailPage from './pages/CarDetailPage';
import DealerSettingsPage from './pages/DealerSettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import SuperAdminPage from './pages/SuperAdminPage';
import DealerDashboardPage from './pages/DealerDashboardPage';
import DealerRegisterPage from './pages/DealerRegisterPage';
import DealerOnboardingPage from './pages/DealerOnboardingPage';
import DealerSubscriptionPage from './pages/DealerSubscriptionPage';
import DealerPublicPage from './pages/DealerPublicPage';
import FavoritesPage from './pages/FavoritesPage';
import NotFoundPage from './pages/NotFoundPage';
import DealerProtectedRoute from './components/protected/DealerProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5 } }
});

const PrivateRoute = ({ children }) => {
  const token = useAuthStore(s => s.token);
  return token ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ children, roles }) => {
  const user = useAuthStore(s => s.user);
  return roles.includes(user?.role) ? children : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/cars" element={<CarsPage />} />
            <Route path="/cars/:id" element={<CarDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/become-a-dealer" element={<DealerRegisterPage />} />
            <Route path="/dealers/:id" element={<DealerPublicPage />} />
            <Route path="/favorites" element={<PrivateRoute><FavoritesPage /></PrivateRoute>} />
            <Route path="/account" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />

            {/* Dealer */}
            <Route element={<DealerProtectedRoute />}>
              <Route path="/dealer/onboarding" element={<DealerOnboardingPage />} />
              <Route path="/dealer/dashboard" element={<DealerDashboardPage />} />
              <Route path="/dealer/subscription" element={<DealerSubscriptionPage />} />
              <Route path="/dealer/settings" element={<DealerSettingsPage />} /> 
            </Route>

            {/* Super Admin */}
            <Route path="/admin" element={
              <PrivateRoute><RoleRoute roles={['SUPER_ADMIN']}><SuperAdminPage /></RoleRoute></PrivateRoute>
            } />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}