import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ROUTE_MAP, getActiveKey } from '../../components/layout/sidebarConfig';

import TableauDeBord from './TableauDeBord';
import GestionAdministrateurs from './GestionAdministrateurs';
import GestionTechniciens from './GestionTechniciens';
import Categories from './Categories';

export default function AdminDashboard() {
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
      user={{ name: (user?.prenom || '') + ' ' + (user?.nom || ''), role: 'Administrateur' }}
      activePage={getActiveKey(location.pathname)}
      onNavigate={handleNavigate}
    >
      <Routes>
        <Route index element={<TableauDeBord />} />
        <Route path="administrateurs" element={<GestionAdministrateurs />} />
        <Route path="techniciens" element={<GestionTechniciens />} />
        <Route path="categories" element={<Categories />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
