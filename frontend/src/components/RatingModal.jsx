import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

export default function RatingModal({ reservation, onClose, onRated }) {
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/reviews', { reservation_id: reservation.id, technicien_id: reservation.technicien_id, note, commentaire });
      toast.success('Avis envoyé');
      onRated(reservation.id);
      onClose();
    } catch {
      toast.error("Erreur lors de l'envoi de l'avis");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4" onClick={onClose}>
      <div className="bg-[var(--color-background)] rounded-[var(--radius-lg)] p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <h3 className="font-display text-lg font-bold text-[var(--color-text)] m-0 mb-4">
          Noter la réservation
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          {reservation.service_titre}
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-sm font-semibold text-[var(--color-text)] block mb-1">Note (0-10)</label>
            <input type="range" min="0" max="10" value={note} onChange={e => setNote(Number(e.target.value))}
              className="w-full" />
            <span className="text-sm font-bold text-[var(--color-primary)]">{note}/10</span>
          </div>
          <div className="mb-4">
            <label className="text-sm font-semibold text-[var(--color-text)] block mb-1">Commentaire</label>
            <textarea value={commentaire} onChange={e => setCommentaire(e.target.value)} rows={3}
              className="w-full py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-surface)] text-sm outline-none resize-y" />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose}
              className="py-[8px] px-4 bg-transparent text-[var(--color-text)] border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] text-sm cursor-pointer">
              Annuler
            </button>
            <button type="submit" disabled={submitting}
              className="py-[8px] px-4 bg-[var(--color-primary)] text-white border-none rounded-[var(--radius-md)] text-sm font-semibold cursor-pointer disabled:opacity-50">
              {submitting ? '...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
