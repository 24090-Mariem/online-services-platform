import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ROUTE_MAP, getActiveKey } from '../../components/layout/sidebarConfig';
import HomePage from '../HomePage';
import MesReservations from './MesReservations';
import MesAvis from './MesAvis';
import ProfilePage from '../common/ProfilePage';

const DashboardClient = () => {
  const { user, logout, currentMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleNavigate = async (path) => {
    if (path === ROUTE_MAP.logout) {
      await logout();
      navigate('/login');
      return;
    }
    navigate(path);
  };

  return (
    <DashboardLayout
      role={currentMode || 'client'}
      user={{ name: user?.prenom + ' ' + user?.nom, role: currentMode === 'technicien' ? t('dashboard.tech_role') : t('dashboard.client_role'), photo_profil: user?.photo_profil }}
      activePage={getActiveKey(location.pathname, 'client-dashboard')}
      onNavigate={handleNavigate}
    >
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="mes-reservations" element={<MesReservations />} />
        <Route path="mes-avis" element={<MesAvis />} />
        <Route path="profil" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DashboardClient;
