import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import AdminPageLayout from '../../components/layout/AdminPageLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function Categories() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ nom: '', description: '' });
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
      const res = await api.get('/categories');
      console.log('Response:', res);
      const payload = res.data?.data ?? [];
      console.log('Data:', payload);
      const list = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
      console.log('Is Array:', Array.isArray(list));
      setCategories(list);
    } catch {
      showMessage('error', t('admin.load_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => { await load(); })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => { setForm({ nom: '', description: '' }); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom.trim()) return showMessage('error', t('admin.name_required'));
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
        showMessage('success', t('admin.update_success'));
      } else {
        await api.post('/categories', form);
        showMessage('success', t('admin.create_success'));
      }
      resetForm();
      await load();
    } catch (err) {
      showMessage('error', err.response?.data?.message || t('admin.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cat) => {
    setForm({ nom: cat.nom, description: cat.description || '' });
    setEditingId(cat.id);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      showMessage('success', t('admin.delete_success'));
      await load();
      if (editingId === id) resetForm();
    } catch (err) {
      showMessage('error', err.response?.data?.message || t('admin.delete_error'));
    }
  };

  const inputClass = "py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] font-body text-sm text-[var(--color-text)] bg-[var(--color-surface)]";

  if (loading) return <AdminPageLayout title={t('admin.categories_title')}><LoadingSpinner /></AdminPageLayout>;

  return (
    <AdminPageLayout title={t('admin.categories_title')}>
      {message.text && (
        <div className={`mb-4 p-3 rounded-[var(--radius-sm)] text-sm ${message.type === 'error' ? 'bg-[var(--color-error-bg)] text-[var(--color-error)]' : 'bg-[var(--color-success-bg)] text-[var(--color-success)]'}`}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-6 flex-wrap max-sm:flex-col">
        <input placeholder={t('admin.category_name')} value={form.nom}
          onChange={e => setForm(prev => ({ ...prev, nom: e.target.value }))} required
          className={`${inputClass} flex-[1_0_180px]`} />
        <input placeholder={t('admin.category_desc')} value={form.description}
          onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
          className={`${inputClass} flex-[1_0_180px]`} />
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
      </form>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[var(--text-xs)]">
          <thead>
            <tr><th className="text-left p-2">{t('admin.name_col')}</th><th className="text-left p-2">{t('admin.desc_col')}</th><th className="text-left p-2">{t('admin.actions_col')}</th></tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id} className="border-t border-[var(--color-border)]">
                <td className="p-2">{c.nom}</td>
                <td className="p-2">{c.description || '—'}</td>
                <td className="p-2">
                  <button onClick={() => handleEdit(c)}
                    className="py-[6px] px-4 bg-[var(--color-primary)] text-white border-none rounded-[var(--radius-sm)] font-body text-[var(--text-xs)] cursor-pointer mr-1">
                    {t('admin.edit')}
                  </button>
                  <button onClick={() => handleDelete(c.id)}
                    className="py-[6px] px-3 bg-[var(--color-error)] text-white border-none rounded-[var(--radius-sm)] font-body text-[var(--text-xs)] cursor-pointer">
                    {t('admin.delete')}
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={3} className="text-center py-8 text-[var(--color-text-muted)]">{t('admin.empty')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminPageLayout>
  );
}
