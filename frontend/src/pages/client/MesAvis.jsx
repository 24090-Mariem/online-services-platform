import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function MesAvis() {
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/reviews/client/mine');
        console.log('Response:', res);
        const payload = res.data?.data ?? [];
        console.log('Data:', payload);
        const list = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
        console.log('Is Array:', Array.isArray(list));
        setAvis(list);
      } catch {
        toast.error(t('services.loading_error'));
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="text-center py-12 text-[var(--color-text-muted)]">{t('reservations.loading')}</div>;

  return (
    <div className="max-w-[900px] mx-auto">
      <h1 className="font-display text-[var(--text-xl)] font-bold text-[var(--color-text)] m-0 mb-6">{t('sidebar.my_reviews')}</h1>

      {avis.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <p className="text-lg mb-2">{t('reservations.empty_title')}</p>
          <p className="text-sm">{t('reservations.empty_subtitle')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {avis.map(a => (
            <div key={a.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <div>
                  <h3 className="text-base font-semibold text-[var(--color-text)] m-0">{a.service_titre}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1 m-0">
                    {t('reservations.technician_label')}: {a.technicien_prenom} {a.technicien_nom}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i <= Math.round((a.note||0)/2) ? 'var(--color-warning)' : 'none'} stroke="var(--color-warning)" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                  <span className="text-sm font-semibold text-[var(--color-text)] ml-1">{a.note}/10</span>
                </div>
              </div>
              {a.commentaire && (
                <p className="text-sm text-[var(--color-text-muted)] m-0">{a.commentaire}</p>
              )}
              <p className="text-xs text-[var(--color-text-muted)] mt-2">
                {new Date(a.date_creation).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
