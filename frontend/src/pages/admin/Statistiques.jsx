import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import AdminPageLayout from '../../components/layout/AdminPageLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function Statistiques() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/stats/overview');
        setStats(res.data.data);
      } catch {
        setError(t('admin.load_error'));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  if (loading) {
    return (
      <AdminPageLayout title={t('sidebar.statistics')}>
        <LoadingSpinner />
      </AdminPageLayout>
    );
  }

  const cards = [
    { label: t('sidebar.technicians'), value: stats?.techniciens ?? 0, color: 'var(--color-primary)' },
    { label: t('sidebar.reservations'), value: stats?.reservations ?? 0, color: 'var(--color-success)' },
    { label: t('sidebar.reviews'), value: stats?.reviews ?? 0, color: 'var(--color-warning)' },
  ];

  return (
    <AdminPageLayout title={t('sidebar.statistics')} maxWidth="1000px">
      {error && (
        <div className="mb-4 p-3 rounded-[var(--radius-sm)] text-sm bg-[var(--color-error-bg)] text-[var(--color-error)]">
          {error}
        </div>
      )}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-[var(--color-surface)] rounded-[var(--radius-md)] p-5 flex flex-col gap-1"
            style={{ borderTop: `3px solid ${card.color}` }}
          >
            <span className="text-[var(--text-2xl)] font-bold text-[var(--color-text)]">{card.value}</span>
            <span className="text-sm text-[var(--color-text-secondary)]">{card.label}</span>
          </div>
        ))}
      </div>
    </AdminPageLayout>
  );
}
