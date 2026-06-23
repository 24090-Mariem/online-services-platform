import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import AdminPageLayout from '../../components/layout/AdminPageLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const STATUS_STYLES = {
  EN_ATTENTE: { color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
  APPROUVE: { color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
  REJETE: { color: 'var(--color-error)', bg: 'var(--color-error-bg)' },
};

export default function GestionDemandes() {
  const { t } = useTranslation();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/administrateurs/demandes/list');
      setDemandes(res.data.data?.demandes || []);
    } catch {
      showMessage('error', t('admin.load_error'));
    } finally { setLoading(false); }
  };

  useEffect(() => {
    (async () => { await load(); })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await api.post(`/administrateurs/demandes/${id}/approve`);
      showMessage('success', t('admin.demande_approved'));
      await load();
    } catch (err) {
      showMessage('error', err.response?.data?.message || t('admin.error'));
    } finally { setActionLoading(null); }
  };

  const handleReject = async (id) => {
    const commentaire = window.prompt(t('admin.reject_comment_prompt'));
    if (commentaire === null) return;
    setActionLoading(id);
    try {
      await api.post(`/administrateurs/demandes/${id}/reject`, { commentaireAdmin: commentaire });
      showMessage('success', t('admin.demande_rejected'));
      await load();
    } catch (err) {
      showMessage('error', err.response?.data?.message || t('admin.error'));
    } finally { setActionLoading(null); }
  };

  if (loading) return <AdminPageLayout title={t('admin.demandes_title')}><LoadingSpinner /></AdminPageLayout>;

  return (
    <AdminPageLayout title={t('admin.demandes_title')}>
      {message.text && (
        <div className={`mb-4 p-3 rounded-[var(--radius-sm)] text-sm ${message.type === 'error' ? 'bg-[var(--color-error-bg)] text-[var(--color-error)]' : 'bg-[var(--color-success-bg)] text-[var(--color-success)]'}`}>
          {message.text}
        </div>
      )}

      {demandes.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">{t('admin.empty_demandes')}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[var(--text-xs)]">
            <thead>
              <tr>
                <th className="text-left p-2">{t('profile.label_nom')}</th>
                <th className="text-left p-2">{t('profile.label_prenom')}</th>
                <th className="text-left p-2">{t('profile.label_email')}</th>
                <th className="text-left p-2">{t('profile.label_telephone')}</th>
                <th className="text-left p-2">{t('profile.label_specialite')}</th>
                <th className="text-left p-2">{t('admin.status_col')}</th>
                <th className="text-left p-2">{t('admin.date_col')}</th>
                <th className="text-left p-2">{t('admin.actions_col')}</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map(d => {
                const st = STATUS_STYLES[d.statut] || STATUS_STYLES.EN_ATTENTE;
                return (
                  <tr key={d.id} className="border-t border-[var(--color-border)]">
                    <td className="p-2">{d.nom}</td>
                    <td className="p-2">{d.prenom || '\u2014'}</td>
                    <td className="p-2">{d.email}</td>
                    <td className="p-2">{d.telephone || '\u2014'}</td>
                    <td className="p-2">{d.specialite || '\u2014'}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: st.bg, color: st.color }}>
                        {t(`admin.demande_status_${d.statut}`) || d.statut}
                      </span>
                    </td>
                    <td className="p-2">{new Date(d.date_demande).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="p-2">
                      {d.statut === 'EN_ATTENTE' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleApprove(d.id)} disabled={actionLoading === d.id}
                            className="py-[6px] px-4 bg-[var(--color-success)] text-white border-none rounded-[var(--radius-sm)] font-body text-[var(--text-xs)] cursor-pointer disabled:opacity-50">
                            {actionLoading === d.id ? '...' : t('admin.approve')}
                          </button>
                          <button onClick={() => handleReject(d.id)} disabled={actionLoading === d.id}
                            className="py-[6px] px-3 bg-[var(--color-error)] text-white border-none rounded-[var(--radius-sm)] font-body text-[var(--text-xs)] cursor-pointer disabled:opacity-50">
                            {actionLoading === d.id ? '...' : t('admin.reject')}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[var(--color-text-muted)] text-xs italic">
                          {d.commentaire_admin || '\u2014'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminPageLayout>
  );
}
