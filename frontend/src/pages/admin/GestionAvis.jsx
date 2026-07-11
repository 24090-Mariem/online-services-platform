import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import AdminPageLayout from '../../components/layout/AdminPageLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function GestionAvis() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/reviews');
        const payload = res.data?.data ?? [];
        const list = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
        setReviews(list);
      } catch {
        setError(t('admin.load_error'));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  if (loading) {
    return (
      <AdminPageLayout title={t('sidebar.reviews')}>
        <LoadingSpinner />
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout title={t('sidebar.reviews')} maxWidth="1000px">
      {error && (
        <div className="mb-4 p-3 rounded-[var(--radius-sm)] text-sm bg-[var(--color-error-bg)] text-[var(--color-error)]">
          {error}
        </div>
      )}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">{t('admin.empty_reviews', 'Aucun avis')}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[var(--text-xs)]">
            <thead>
              <tr>
                <th className="text-left p-2">{t('reservations.technician_label')}</th>
                <th className="text-left p-2">{t('reviews.note')}</th>
                <th className="text-left p-2">{t('reviews.comment')}</th>
                <th className="text-left p-2">{t('admin.date_col')}</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="border-t border-[var(--color-border)]">
                  <td className="p-2">{review.technicien_prenom} {review.technicien_nom}</td>
                  <td className="p-2 font-semibold">{review.note}/10</td>
                  <td className="p-2">{review.commentaire || '—'}</td>
                  <td className="p-2">
                    {review.date_avis
                      ? new Date(review.date_avis).toLocaleDateString('fr-FR')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPageLayout>
  );
}
