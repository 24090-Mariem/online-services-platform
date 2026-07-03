import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import AdminPageLayout from '../../components/layout/AdminPageLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function GestionServices() {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/services/all');
      console.log('Response:', res);
      const payload = res.data?.data ?? [];
      console.log('Data:', payload);
      const list = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
      console.log('Is Array:', Array.isArray(list));
      setServices(list);
    } catch {
      showMessage('error', t('admin.load_error'));
    } finally { setLoading(false); }
  };

  useEffect(() => {
    (async () => { await load(); })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = async (id) => {
    setToggling(id);
    try {
      await api.put(`/services/${id}/toggle`);
      setServices(prev => prev.map(s => s.id === id ? { ...s, est_actif: s.est_actif ? 0 : 1 } : s));
      showMessage('success', t('admin.service_toggled'));
    } catch (err) {
      showMessage('error', err.response?.data?.message || t('admin.error'));
    } finally { setToggling(null); }
  };

  if (loading) return <AdminPageLayout title={t('admin.services_title')} maxWidth="1000px"><LoadingSpinner /></AdminPageLayout>;

  return (
    <AdminPageLayout title={t('admin.services_title')} maxWidth="1000px">
      {message.text && (
        <div className={`mb-4 p-3 rounded-[var(--radius-sm)] text-sm ${message.type === 'error' ? 'bg-[var(--color-error-bg)] text-[var(--color-error)]' : 'bg-[var(--color-success-bg)] text-[var(--color-success)]'}`}>
          {message.text}
        </div>
      )}

      {services.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">{t('admin.empty_services')}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[var(--text-xs)]">
            <thead>
              <tr>
                <th className="text-left p-2">{t('services.label_titre')}</th>
                <th className="text-left p-2">{t('services.category')}</th>
                <th className="text-left p-2">{t('reservations.technician_label')}</th>
                <th className="text-left p-2">{t('services.price')}</th>
                <th className="text-left p-2">{t('admin.status_col')}</th>
                <th className="text-left p-2">{t('admin.actions_col')}</th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id} className="border-t border-[var(--color-border)]">
                  <td className="p-2 font-semibold">{s.titre}</td>
                  <td className="p-2">{s.categorie_nom || '\u2014'}</td>
                  <td className="p-2">{s.technicien_prenom} {s.technicien_nom}</td>
                  <td className="p-2">{s.prix ? `${Number(s.prix).toLocaleString()} MRU` : '\u2014'}</td>
                  <td className="p-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.est_actif ? 'text-[var(--color-success)] bg-[var(--color-success-bg)]' : 'text-[var(--color-text-muted)] bg-[var(--color-surface)]'}`}>
                      {s.est_actif ? t('services.active') : t('services.inactive')}
                    </span>
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handleToggle(s.id)}
                      disabled={toggling === s.id}
                      className={`py-[6px] px-4 border-none rounded-[var(--radius-sm)] font-body text-[var(--text-xs)] cursor-pointer disabled:opacity-50 ${s.est_actif ? 'bg-[var(--color-warning)] text-white' : 'bg-[var(--color-success)] text-white'}`}
                    >
                      {toggling === s.id ? '...' : (s.est_actif ? t('admin.deactivate') : t('admin.activate'))}
                    </button>
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
