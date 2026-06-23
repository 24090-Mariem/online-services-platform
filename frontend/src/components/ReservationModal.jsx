import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function ReservationModal({ service, onClose }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!date) {
      toast.error('Veuillez sélectionner une date');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/reservations', {
        service_id: service.id,
        date_service: date,
        notes,
      });
      toast.success('Réservation effectuée avec succès');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la réservation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[var(--color-background)] rounded-[var(--radius-lg)] p-8 max-w-md w-full mx-4 shadow-[var(--shadow-xl)]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-[var(--text-lg)] font-bold text-[var(--color-text)] m-0">
            {t('reservations.book_title') || 'Réserver'} : {service.titre}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] border-none bg-transparent text-[var(--color-text-muted)] cursor-pointer hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] text-lg leading-none">&times;</button>
        </div>

        {service.prix && (
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            {t('reservations.price_label') || 'Prix'} : <strong>{service.prix} MRU</strong>
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[var(--color-text)]">
              {t('reservations.date_label') || 'Date'} *
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              className="w-full py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] font-body text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-secondary)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[var(--color-text)]">
              {t('reservations.notes_label') || 'Notes'}
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] font-body text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-secondary)] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-[13px] bg-transparent text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-[var(--radius-md)] font-body text-base font-semibold cursor-pointer hover:bg-[var(--color-surface)]"
            >
              {t('reservations.cancel') || 'Annuler'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-[13px] bg-[var(--color-secondary)] text-white border-none rounded-[var(--radius-md)] font-body text-base font-semibold cursor-pointer hover:bg-[var(--color-secondary-hover)] disabled:opacity-50"
            >
              {submitting ? '...' : (t('reservations.confirm') || 'Confirmer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
