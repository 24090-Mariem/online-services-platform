import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDashboardPath } from '../utils/dashboard';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import SetPassword from '../pages/auth/SetPassword';
import ClientDashboard from '../pages/client/Dashboard';
import TechnicienDashboard from '../pages/technicien/Dashboard';
import AdminDashboard from '../pages/admin/Dashboard';
import PublicLayout from '../components/layout/PublicLayout';
import NotificationsPage from '../pages/common/NotificationsPage';
import PublicTechnicienProfile from '../pages/common/PublicTechnicienProfile';
import AllTechniciens from '../pages/client/AllTechniciens';
import AllServices from '../pages/client/AllServices';

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

function PublicHomeRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to={getDashboardPath(user.role)} replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/set-password" element={<SetPassword />} />

      <Route path="/technicien/:id" element={<PublicTechnicienProfile />} />
      <Route path="/techniciens" element={<AllTechniciens />} />
      <Route path="/services" element={<AllServices />} />

      <Route path="/notifications" element={
        <ProtectedRoute>
          <NotificationsPage />
        </ProtectedRoute>
      } />

      <Route path="/" element={
        <PublicHomeRoute>
          <PublicLayout>
            <Login/>
          </PublicLayout>
        </PublicHomeRoute>
      } />

      <Route path="/client/dashboard/*" element={
        <ProtectedRoute roles={['client']}>
          <ClientDashboard />
        </ProtectedRoute>
      } />
      <Route path="/technicien/dashboard/*" element={
        <ProtectedRoute roles={['technicien']}>
          <TechnicienDashboard />
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
