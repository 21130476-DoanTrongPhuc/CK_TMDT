import { type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import SellerLayout from './layouts/SellerLayout';
import Login from './pages/Login';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProducts from './pages/seller/SellerProducts';
import SellerOrders from './pages/seller/SellerOrders';
import SellerCustomOrders from './pages/seller/SellerCustomOrders';
import SellerPayments from './pages/seller/SellerPayments';
import SellerPromotions from './pages/seller/SellerPromotions';
import AdminReviews from './pages/admin/AdminReviews';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();
  const defaultPath = user?.role === 'ADMIN' ? '/admin/dashboard' : '/seller/dashboard';

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={defaultPath} replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <SellerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={defaultPath} replace />} />
        <Route path="seller/dashboard" element={<SellerDashboard />} />
        <Route path="seller/products" element={<SellerProducts />} />
        <Route path="seller/orders" element={<SellerOrders />} />
        <Route path="seller/custom-orders" element={<SellerCustomOrders />} />
        <Route path="seller/payments" element={<SellerPayments />} />
        <Route path="seller/promotions" element={<SellerPromotions />} />
        <Route path="admin/reviews" element={<AdminReviews />} />
        <Route path="admin/dashboard" element={<AdminDashboard />} />
        <Route path="admin/products" element={<AdminProducts />} />
        <Route path="admin/orders" element={<AdminOrders />} />
        <Route path="admin/users" element={<AdminUsers />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

