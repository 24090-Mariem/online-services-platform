import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import AdminPageLayout from '../../components/layout/AdminPageLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const emptyForm = { nom: '', email: '', password: '' };

export default function GestionAdministrateurs() {
  const { t } = useTranslation();
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/administrateurs');
      setAdmins(res.data.data || []);
    } catch {
      showMessage('error', t('admin.load_error_generic'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => { await load(); })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => { setForm({ ...emptyForm }); setEditingId(null); };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        const { password, ...data } = form;
        await api.put(`/administrateurs/${editingId}`, password ? form : data);
        showMessage('success', t('admin.administrator_updated'));
      } else {
        await api.post('/administrateurs', { ...form, role: 'admin' });
        showMessage('success', t('admin.administrator_created'));
      }
      resetForm();
      await load();
    } catch (err) {
      showMessage('error', err.response?.data?.message || t('admin.error'));
    } finally { setSubmitting(false); }
  };

  const handleEdit = (admin) => {
    setForm({ nom: admin.nom, email: admin.email, password: '' });
    setEditingId(admin.id);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/administrateurs/${id}`);
      showMessage('success', t('admin.administrator_deleted'));
      await load();
    } catch { showMessage('error', t('admin.delete_error')); }
  };

  const inputClass = "py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] font-body text-sm text-[var(--color-text)] bg-[var(--color-surface)]";

  if (loading) return <AdminPageLayout title={t('admin.administrators_title')}><LoadingSpinner /></AdminPageLayout>;

  return (
    <AdminPageLayout title={t('admin.administrators_title')}>
      {message.text && (
        <div className={`mb-4 p-3 rounded-[var(--radius-sm)] text-sm ${message.type === 'error' ? 'bg-[var(--color-error-bg)] text-[var(--color-error)]' : 'bg-[var(--color-success-bg)] text-[var(--color-success)]'}`}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-3 items-end flex-wrap">
          <input name="nom" placeholder={t('profile.label_nom') + ' *'} value={form.nom} onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))} required className={inputClass} />
          <input name="email" type="email" placeholder={t('profile.label_email') + ' *'} value={form.email} onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))} required className={inputClass} />
          <input name="password" type="password" placeholder={editingId ? t('admin.new_password') : 'Mot de passe *'} value={form.password} onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))} required={!editingId} className={inputClass} />
          <button type="submit" disabled={submitting}
            className="py-[11px] px-5 bg-[var(--color-primary)] text-white border-none rounded-[var(--radius-md)] font-body text-sm font-semibold cursor-pointer whitespace-nowrap disabled:opacity-50">
            {submitting ? t('admin.loading') : editingId ? t('admin.edit') : t('admin.add')}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm}
              className="py-[11px] px-4 bg-[var(--color-background)] text-[var(--color-text)] border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] font-body text-sm cursor-pointer whitespace-nowrap">
              {t('admin.cancel')}
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[var(--text-xs)]">
          <thead>
            <tr><th className="text-left p-2">{t('profile.label_nom')}</th><th className="text-left p-2">{t('profile.label_email')}</th><th className="text-left p-2">{t('admin.role_col')}</th><th className="text-left p-2">{t('admin.actions_col')}</th></tr>
          </thead>
          <tbody>
            {admins.map(a => (
              <tr key={a.id} className="border-t border-[var(--color-border)]">
                <td className="p-2">{a.nom}</td>
                <td className="p-2">{a.email}</td>
                <td className="p-2">{a.role}</td>
                <td className="p-2">
                  <button onClick={() => handleEdit(a)}
                    className="py-[6px] px-4 bg-[var(--color-primary)] text-white border-none rounded-[var(--radius-sm)] font-body text-[var(--text-xs)] cursor-pointer mr-1">{t('admin.edit')}</button>
                  <button onClick={() => handleDelete(a.id)}
                    className="py-[6px] px-3 bg-[var(--color-error)] text-white border-none rounded-[var(--radius-sm)] font-body text-[var(--text-xs)] cursor-pointer">{t('admin.delete')}</button>
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr><td colSpan={4} className="text-center py-8 text-[var(--color-text-muted)]">{t('admin.empty_administrators')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminPageLayout>
  );
}
