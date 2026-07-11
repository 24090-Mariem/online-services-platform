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

const UPLOADS_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '') + '/uploads'
  : '/uploads';

const privateDocName = (storedPath) => {
  if (!storedPath) return null;
  return storedPath.startsWith('private/') ? storedPath.slice('private/'.length) : storedPath;
};

const openPrivateDoc = async (storedPath) => {
  const name = privateDocName(storedPath);
  if (!name) return;
  const res = await api.get(`/uploads/private/${encodeURIComponent(name)}`, { responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export default function GestionDemandes() {
  const { t } = useTranslation();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [expandedDocs, setExpandedDocs] = useState(null);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null });
  const [rejectComment, setRejectComment] = useState('');

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/administrateurs/demandes/list');
      const payload = res.data?.data ?? [];
      const list = Array.isArray(payload) ? payload : (Array.isArray(payload?.demandes) ? payload.demandes : []);
      setDemandes(list);
    } catch {
      showMessage('error', t('admin.load_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => { await load(); })();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await api.post(`/administrateurs/demandes/${id}/approve`);
      showMessage('success', t('admin.demande_approved'));
      await load();
    } catch (err) {
      showMessage('error', err.response?.data?.message || t('admin.error'));
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (id) => {
    setRejectModal({ open: true, id });
    setRejectComment('');
  };

  const handleRejectConfirm = async () => {
    const id = rejectModal.id;
    setRejectModal({ open: false, id: null });
    setActionLoading(id);
    try {
      await api.post(`/administrateurs/demandes/${id}/reject`, {
        commentaireAdmin: rejectComment,
      });
      showMessage('success', t('admin.demande_rejected'));
      await load();
    } catch (err) {
      showMessage('error', err.response?.data?.message || t('admin.error'));
    } finally {
      setActionLoading(null);
    }
  };

  const hasDocs = (d) => d.photo_profil || d.piece_identite || d.diplome;

  if (loading)
    return (
      <AdminPageLayout title={t('admin.demandes_title')}>
        <LoadingSpinner />
      </AdminPageLayout>
    );

  return (
    <AdminPageLayout title={t('admin.demandes_title')}>
      {message.text && (
        <div
          className={`mb-4 p-3 rounded-[var(--radius-sm)] text-sm ${
            message.type === 'error'
              ? 'bg-[var(--color-error-bg)] text-[var(--color-error)]'
              : 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
          }`}
        >
          {message.text}
        </div>
      )}

      {demandes.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          {t('admin.empty_demandes')}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[1200px] w-full border-collapse text-[var(--text-xs)]">
            <thead>
              <tr>
                <th className="text-left p-2">{t('profile.label_nom')}</th>
                <th className="text-left p-2">{t('profile.label_prenom')}</th>
                <th className="text-left p-2">{t('profile.label_email')}</th>
                <th className="text-left p-2">{t('profile.label_telephone')}</th>
                <th className="text-left p-2">{t('profile.label_specialite')}</th>
                <th className="text-left p-2">{t('admin.status_col')}</th>
                <th className="text-left p-2">{t('admin.date_col')}</th>
                <th className="text-left p-2">{t('admin.label_docs')}</th>
                <th className="text-left p-2">{t('admin.actions')}</th>
              </tr>
            </thead>

            <tbody>
              {demandes.map((d) => {
                const st =
                  STATUS_STYLES[d.statut] || STATUS_STYLES.EN_ATTENTE;
                const showDocs = expandedDocs === d.id;

                return (
                  <tr
                    key={d.id}
                    className="border-t border-[var(--color-border)]"
                  >
                    <td className="p-2">{d.nom}</td>
                    <td className="p-2">{d.prenom || '—'}</td>
                    <td className="p-2">{d.email}</td>
                    <td className="p-2">{d.telephone || '—'}</td>
                    <td className="p-2">{d.specialite || '—'}</td>

                    <td className="p-2">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: st.bg, color: st.color }}
                      >
                        {t(`admin.demande_status_${d.statut}`) || d.statut}
                      </span>
                    </td>

                    <td className="p-2">
                      {new Date(d.date_demande).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="p-2">
                      {hasDocs(d) ? (
                        <button
                          onClick={() =>
                            setExpandedDocs(showDocs ? null : d.id)
                          }
                          className="py-[4px] px-3 bg-[var(--color-primary)] text-white border-none rounded-[var(--radius-sm)] font-body text-[var(--text-xs)] cursor-pointer"
                        >
                          {showDocs
                            ? t('admin.hide_docs')
                            : t('admin.view_docs')}
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="p-2">
                      {d.statut === 'EN_ATTENTE' ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleApprove(d.id)}
                            disabled={actionLoading === d.id}
                            className="py-[6px] px-4 bg-[var(--color-success)] text-white border-none rounded-[var(--radius-sm)] font-body text-[var(--text-xs)] cursor-pointer disabled:opacity-50"
                          >
                            {actionLoading === d.id ? '...' : t('admin.approve')}
                          </button>

                          <button
                            onClick={() => openRejectModal(d.id)}
                            disabled={actionLoading === d.id}
                            className="py-[6px] px-3 bg-[var(--color-error)] text-white border-none rounded-[var(--radius-sm)] font-body text-[var(--text-xs)] cursor-pointer disabled:opacity-50"
                          >
                            {actionLoading === d.id ? '...' : t('admin.reject')}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[var(--color-text-muted)] text-xs italic">
                          {d.commentaire_admin || '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {expandedDocs !== null &&
            (() => {
              const d = demandes.find((x) => x.id === expandedDocs);
              if (!d) return null;

              return (
                <div className="mt-4 p-4 border border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-surface)]">
                  <h3 className="text-sm font-semibold mb-3">
                    Documents - {d.nom} {d.prenom}
                  </h3>

                  <div className="flex flex-wrap gap-4">
                    {d.photo_profil && (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs text-[var(--color-text-muted)]">
                          Photo de profil
                        </span>
                        <img
                          src={`${UPLOADS_BASE}/${d.photo_profil}`}
                          alt=""
                          className="w-24 h-24 object-cover rounded-[var(--radius-md)] border"
                        />
                      </div>
                    )}
                    {d.piece_identite && (
                      <button
                        type="button"
                        onClick={() => openPrivateDoc(d.piece_identite)}
                        className="py-2 px-3 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sm)] cursor-pointer"
                      >
                        {t('admin.id_document', 'Pièce d\'identité')}
                      </button>
                    )}
                    {d.diplome && (
                      <button
                        type="button"
                        onClick={() => openPrivateDoc(d.diplome)}
                        className="py-2 px-3 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sm)] cursor-pointer"
                      >
                        {t('admin.diploma', 'Diplôme')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
        </div>
      )}

      {rejectModal.open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40" onClick={() => setRejectModal({ open: false, id: null })}>
          <div className="bg-[var(--color-background)] rounded-[var(--radius-lg)] p-6 w-full max-w-md mx-4 shadow-xl border border-[var(--color-border)]" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-3 text-[var(--color-text)]">{t('admin.reject_title')}</h3>
            <textarea
              className="w-full min-h-[100px] p-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] resize-none outline-none focus:border-[var(--color-secondary)]"
              placeholder={t('admin.reject_comment_placeholder')}
              value={rejectComment}
              onChange={e => setRejectComment(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                className="py-2 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-transparent text-[var(--color-text)] cursor-pointer"
                onClick={() => setRejectModal({ open: false, id: null })}
              >
                {t('admin.cancel')}
              </button>
              <button
                className="py-2 px-4 rounded-[var(--radius-sm)] bg-[var(--color-error)] text-white border-none cursor-pointer"
                onClick={handleRejectConfirm}
              >
                {t('admin.confirm_reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPageLayout>
  );
}