import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ROUTE_MAP, getActiveKey } from '../../components/layout/sidebarConfig';

import TableauDeBord from './TableauDeBord';
import GestionAdministrateurs from './GestionAdministrateurs';
import GestionTechniciens from './GestionTechniciens';
import GestionDemandes from './GestionDemandes';
import GestionServices from './GestionServices';
import Categories from './Categories';
import Statistiques from './Statistiques';
import GestionAvis from './GestionAvis';
import Profil from './Profil';
import NotificationsPanel from '../../components/notifications/NotificationsPanel';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    if (path === ROUTE_MAP.logout) {
      logout();
      navigate('/login');
      return;
    }
    navigate(path);
  };

  return (
    <DashboardLayout
      role="admin"
      user={{ name: (user?.prenom || '') + ' ' + (user?.nom || ''), role: t('profile.role_admin'), photo_profil: user?.photo_profil }}
      activePage={getActiveKey(location.pathname)}
      onNavigate={handleNavigate}
    >
      <Routes>
        <Route index element={<TableauDeBord />} />
        <Route path="administrateurs" element={<GestionAdministrateurs />} />
        <Route path="techniciens" element={<GestionTechniciens />} />
        <Route path="demandes" element={<GestionDemandes />} />
        <Route path="services" element={<GestionServices />} />
        <Route path="categories" element={<Categories />} />
        <Route path="statistiques" element={<Statistiques />} />
        <Route path="avis" element={<GestionAvis />} />
        <Route path="profil" element={<Profil />} />
        <Route path="notifications" element={<NotificationsPanel />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
