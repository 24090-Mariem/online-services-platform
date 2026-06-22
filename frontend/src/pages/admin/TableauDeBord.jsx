import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AdminPageLayout from '../../components/layout/AdminPageLayout';

export default function TableauDeBord() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/staff/login');
  };

  const stats = [
    { label: 'Techniciens', value: '12', color: 'var(--color-primary)' },
    { label: 'Clients', value: '48', color: 'var(--color-success)' },
    { label: 'Services', value: '8', color: 'var(--color-warning)' },
    { label: 'Demandes', value: '23', color: 'var(--color-error)' },
  ];

  return (
    <AdminPageLayout title="Tableau de bord" maxWidth="1000px">
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">
            Bienvenue, {user?.prenom} {user?.nom}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="py-[10px] px-5 bg-[var(--color-error)] text-white border-none rounded-[var(--radius-md)] font-body text-sm font-semibold cursor-pointer"
        >
          Déconnexion
        </button>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-[var(--color-surface)] rounded-[var(--radius-md)] p-5 flex flex-col gap-1"
            style={{ borderTop: `3px solid ${s.color}` }}
          >
            <span className="text-[var(--text-2xl)] font-bold text-[var(--color-text)]">{s.value}</span>
            <span className="text-sm text-[var(--color-text-secondary)]">{s.label}</span>
          </div>
        ))}
      </div>
    </AdminPageLayout>
  );
}
