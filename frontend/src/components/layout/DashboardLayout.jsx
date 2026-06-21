import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 var(--space-8)',
  height: 'var(--navbar-height)',
  background: 'var(--color-surface)',
  borderBottom: '1px solid var(--color-border)',
};

const userInfoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-3)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text)',
};

const badgeStyle = {
  padding: '2px 10px',
  borderRadius: 'var(--radius-full)',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  background: 'var(--color-primary)',
  color: '#fff',
};

const logoutBtnStyle = {
  padding: '8px 20px',
  border: '1.5px solid var(--color-error)',
  borderRadius: 'var(--radius-md)',
  background: 'transparent',
  color: 'var(--color-error)',
  fontSize: 'var(--text-sm)',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
};

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background)' }}>
      <nav style={navStyle}>
        <div style={userInfoStyle}>
          <span>{user?.email}</span>
          <span style={badgeStyle}>{user?.role}</span>
        </div>
        <button
          style={logoutBtnStyle}
          onClick={handleLogout}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'var(--color-error)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--color-error)';
          }}
        >
          Déconnexion
        </button>
      </nav>
      <main style={{ flex: 1, padding: 'var(--space-8)' }}>
        {children}
      </main>
    </div>
  );
}
