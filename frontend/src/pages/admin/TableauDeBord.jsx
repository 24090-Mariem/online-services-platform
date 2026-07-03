import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import AdminPageLayout from '../../components/layout/AdminPageLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function TableauDeBord() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/stats/overview');
        setStats(res.data.data);
      } catch {
        setStats({ techniciens: 0, reservations: 0, reviews: 0 });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const cards = [
    { label: 'Techniciens vérifiés', value: stats?.techniciens ?? '—', color: 'var(--color-primary)' },
    { label: 'Réservations', value: stats?.reservations ?? '—', color: 'var(--color-success)' },
    { label: 'Avis', value: stats?.reviews ?? '—', color: 'var(--color-warning)' },
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
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
          {cards.map((s) => (
            <div
              key={s.label}
              className="bg-[var(--color-surface)] rounded-[var(--radius-md)] p-5 flex flex-col gap-1"
              style={{ borderTop: `3px solid ${s.color}` }}
            >
              <span className="text-[var(--text-2xl)] font-bold text-[var(--color-text)]">{s.value}</span>
              <span className="text-sm text-[var(--color-text-secondary)]">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </AdminPageLayout>
  );
}
