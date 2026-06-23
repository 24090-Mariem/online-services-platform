import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ROUTE_MAP, getActiveKey } from '../../components/layout/sidebarConfig';
import MesServices from './MesServices';
import GestionReservations from './GestionReservations';
import ProfilePage from '../common/ProfilePage';

const DashboardTechnicien = () => {
  const { user, logout, currentMode, switchMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleSwitchMode = () => {
    const next = currentMode === 'technicien' ? 'client' : 'technicien';
    switchMode(next);
    navigate(next === 'technicien' ? '/technicien/dashboard' : '/client/dashboard');
  };

  const handleNavigate = async (path) => {
    if (path === ROUTE_MAP.logout) {
      await logout();
      navigate('/login');
      return;
    }
    navigate(path);
  };

  const userRoles = user?.roles || [];

  return (
    <DashboardLayout
      role={currentMode || 'technicien'}
      user={{ name: (user?.prenom || '') + ' ' + (user?.nom || ''), role: currentMode === 'client' ? t('dashboard.client_role') : t('dashboard.tech_role') }}
      activePage={getActiveKey(location.pathname)}
      onNavigate={handleNavigate}
    >
      <Routes>
        <Route index element={<div className="max-w-[900px] mx-auto">
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] border border-[var(--color-border)] p-8">
            <h1 className="font-display text-[var(--text-xl)] font-bold text-[var(--color-text)] m-0">{t('dashboard.tech_title')}</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-2">{t('dashboard.tech_welcome')}, {user?.prenom} {user?.nom}</p>
          </div>
        </div>} />
        <Route path="services" element={<MesServices />} />
        <Route path="reservations" element={<GestionReservations />} />
        <Route path="profil" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/technicien/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DashboardTechnicien;
