import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../services/api';
import RatingModal from '../../components/RatingModal';

const STATUS_LABELS = {
  EN_ATTENTE: 'reservations.status_pending',
  CONFIRMEE: 'reservations.status_confirmed',
  TERMINEE: 'reservations.status_completed',
  REJETEE: 'reservations.status_rejected',
};

const STATUS_COLORS = {
  EN_ATTENTE: 'var(--color-warning)',
  CONFIRMEE: 'var(--color-success)',
  TERMINEE: 'var(--color-primary)',
  REJETEE: 'var(--color-error)',
};

export default function MesReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingReservation, setRatingReservation] = useState(null);
  const [ratedIds, setRatedIds] = useState(new Set());
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/reservations/mine');
        const data = res.data.data || [];
        setReservations(data);
        setRatedIds(new Set(data.filter(r => r.avis_id).map(r => r.id)));
      } catch {
        toast.error('Erreur lors du chargement');
      } finally { setLoading(false); }
    })();
  }, []);

  const handleRated = (id) => {
    setRatedIds(prev => new Set([...prev, id]));
  };

  if (loading) return <div className="text-center py-12 text-[var(--color-text-muted)]">{t('reservations.loading')}</div>;

  return (
    <div className="max-w-[900px] mx-auto">
      <h1 className="font-display text-[var(--text-xl)] font-bold text-[var(--color-text)] m-0 mb-6">{t('reservations.my_title')}</h1>

      {reservations.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <p className="text-lg mb-2">{t('reservations.empty_title')}</p>
          <p className="text-sm">{t('reservations.empty_subtitle')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reservations.map(r => (
            <div key={r.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <div>
                  <h3 className="text-base font-semibold text-[var(--color-text)] m-0">{r.service_titre}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1 m-0">
                    {t('reservations.technician_label')}: {r.technicien_prenom} {r.technicien_nom}
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: STATUS_COLORS[r.statut] + '20', color: STATUS_COLORS[r.statut] }}>
                  {t(STATUS_LABELS[r.statut] || r.statut)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-[var(--color-text-secondary)] max-sm:grid-cols-1">
                <span>{t('reservations.category_label')}: {r.categorie_nom || '-'}</span>
                <span>{t('reservations.price_label')}: {r.service_prix ? `${r.service_prix} DH` : '-'}</span>
                <span>{t('reservations.date_label')}: {new Date(r.date_service).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                <span>{t('reservations.booked_on')}: {new Date(r.date_reservation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                {r.notes && <span className="col-span-2">{t('reservations.notes_label')}: {r.notes}</span>}
              </div>
              {r.statut === 'TERMINEE' && (
                <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                  {ratedIds.has(r.id) ? (
                    <span className="text-sm text-[var(--color-success)] font-semibold">
                      {'\u2B50'} {t('reservations.already_rated')} ({r.avis_note}/10)
                    </span>
                  ) : (
                    <button onClick={() => setRatingReservation(r)}
                      className="py-[8px] px-4 bg-[var(--color-warning)] text-white border-none rounded-[var(--radius-sm)] text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity">
                      {'\u2B50'} {t('reservations.rate')}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {ratingReservation && (
        <RatingModal
          reservation={ratingReservation}
          onClose={() => setRatingReservation(null)}
          onRated={handleRated}
        />
      )}
    </div>
  );
}
