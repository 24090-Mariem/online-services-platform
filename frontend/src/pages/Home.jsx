import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDashboardPath } from '../utils/dashboard';

export default function Home() {
  const { user } = useAuth();
  return <Navigate to={getDashboardPath(user.role)} replace />;
}
