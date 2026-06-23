import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function PublicTechnicienProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [technicien, setTechnicien] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/techniciens/${id}`)
      .then(r => { setTechnicien(r.data.data); setLoading(false); })
      .catch(() => { setError('Technicien introuvable'); setLoading(false); });
  }, [id]);

  if (loading) return <LoadingSpinner overlay />;
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p className="text-[var(--color-text-muted)] text-lg">{error}</p>
      <button onClick={() => navigate('/')}
        className="py-[10px] px-6 bg-[var(--color-secondary)] text-white border-none rounded-[var(--radius-sm)] cursor-pointer font-semibold">
        Retour à l'accueil
      </button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={() => navigate(-1)}
        className="mb-6 text-sm text-[var(--color-secondary)] bg-none border-none cursor-pointer font-semibold hover:underline">&larr; Retour</button>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-8">
        <div className="flex items-center gap-6 mb-6">
          {technicien.photo_profil
            ? <img src={`/uploads/${technicien.photo_profil}`} alt={technicien.prenom} className="w-24 h-24 rounded-full object-cover border-3 border-[var(--color-primary)]" />
            : <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-surface)] flex items-center justify-center text-4xl border-3 border-[var(--color-primary)]">👤</div>
          }
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--color-text)] m-0">{technicien.prenom} {technicien.nom}</h1>
            <p className="text-base text-[var(--color-secondary)] font-medium mt-1">{technicien.specialite}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {technicien.telephone && (
            <div>
              <span className="text-[var(--color-text-muted)]">Téléphone</span>
              <p className="text-[var(--color-text)] font-medium m-0">{technicien.telephone}</p>
            </div>
          )}
          {technicien.adresse && (
            <div>
              <span className="text-[var(--color-text-muted)]">Adresse</span>
              <p className="text-[var(--color-text)] font-medium m-0">{technicien.adresse}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
