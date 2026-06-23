import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ROUTE_MAP, getActiveKey } from '../../components/layout/sidebarConfig';
import NotificationsPanel from '../../components/notifications/NotificationsPanel';

export default function NotificationsPage() {
  const { user, logout, currentMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const role = currentMode || user?.role || 'client';
  const rolePrefix = role === 'technicien' ? 'tech' : role;

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
      role={role}
      user={{ name: user?.prenom + ' ' + user?.nom, role: t(`dashboard.${role}_role`) }}
      activePage={getActiveKey(location.pathname, `${rolePrefix}-dashboard`)}
      onNavigate={handleNavigate}
    >
      <NotificationsPanel />
    </DashboardLayout>
  );
}
