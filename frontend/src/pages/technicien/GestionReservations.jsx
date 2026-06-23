import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../services/api';

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

export default function GestionReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const load = async () => {
    try {
      const res = await api.get('/reservations/technicien');
      setReservations(res.data.data || []);
    } catch {
      toast.error('Erreur lors du chargement');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    (async () => { await load(); })();
  }, []);

  const handleAction = async (id, action) => {
    try {
      await api.put(`/reservations/${id}/${action}`);
      toast.success(action === 'accept' ? 'Réservation acceptée' : action === 'reject' ? 'Réservation refusée' : 'Réservation terminée');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  if (loading) return <div className="text-center py-12 text-[var(--color-text-muted)]">{t('reservations.loading')}</div>;

  return (
    <div className="max-w-[900px] mx-auto">
      <h1 className="font-display text-[var(--text-xl)] font-bold text-[var(--color-text)] m-0 mb-6">{t('reservations.manage_title')}</h1>

      {reservations.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <p className="text-lg">{t('reservations.empty_tech')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reservations.map(r => (
            <div key={r.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <div>
                  <h3 className="text-base font-semibold text-[var(--color-text)] m-0">{r.service_titre}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1 m-0">
                    {t('reservations.client_label')}: {r.client_prenom} {r.client_nom}
                    {r.client_telephone && <span> - {r.client_telephone}</span>}
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: STATUS_COLORS[r.statut] + '20', color: STATUS_COLORS[r.statut] }}>
                  {t(STATUS_LABELS[r.statut] || r.statut)}
                </span>
              </div>
              <div className="flex gap-4 text-sm text-[var(--color-text-secondary)] mb-3">
                <span>{t('reservations.date_label')}: {new Date(r.date_service).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                {r.notes && <span>{t('reservations.notes_label')}: {r.notes}</span>}
              </div>
              {r.statut === 'EN_ATTENTE' && (
                <div className="flex gap-2">
                  <button onClick={() => handleAction(r.id, 'accept')}
                    className="py-[8px] px-5 bg-[var(--color-success)] text-white border-none rounded-[var(--radius-sm)] text-sm font-semibold cursor-pointer hover:opacity-90">{t('reservations.accept')}</button>
                  <button onClick={() => handleAction(r.id, 'reject')}
                    className="py-[8px] px-5 bg-[var(--color-error)] text-white border-none rounded-[var(--radius-sm)] text-sm font-semibold cursor-pointer hover:opacity-90">{t('reservations.reject')}</button>
                </div>
              )}
              {r.statut === 'CONFIRMEE' && (
                <button onClick={() => handleAction(r.id, 'complete')}
                  className="py-[8px] px-5 bg-[var(--color-primary)] text-white border-none rounded-[var(--radius-sm)] text-sm font-semibold cursor-pointer hover:opacity-90">{t('reservations.mark_complete')}</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
