import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDashboardPath } from '../utils/dashboard';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import Home from '../pages/Home';
import DashboardLayout from '../components/layout/DashboardLayout';
import ClientDashboard from '../pages/client/Dashboard';
import TechnicienDashboard from '../pages/technicien/Dashboard';
import AdminDashboard from '../pages/admin/Dashboard';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
    </div>
  );
}

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  return user ? <Navigate to={getDashboardPath(user.role)} replace /> : children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />

      <Route path="/client/dashboard" element={
        <ProtectedRoute roles={['client']}>
          <DashboardLayout><ClientDashboard /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/technicien/dashboard" element={
        <ProtectedRoute roles={['technicien']}>
          <DashboardLayout><TechnicienDashboard /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/dashboard/*" element={
        <ProtectedRoute roles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
