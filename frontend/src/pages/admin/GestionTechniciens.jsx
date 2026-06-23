import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import AdminPageLayout from '../../components/layout/AdminPageLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const emptyForm = {
  nom: '', prenom: '', email: '', telephone: '',
  adresse: '', specialite: '', password: '',
  piece_identite: null, photo_profil: null,
};

export default function GestionTechniciens() {
  const { t } = useTranslation();
  const [techniciens, setTechniciens] = useState([]);
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
      const res = await api.get('/techniciens');
      setTechniciens(res.data.data || []);
    } catch {
      showMessage('error', t('admin.load_error_generic'));
    } finally { setLoading(false); }
  };

  useEffect(() => {
    (async () => { await load(); })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => { setForm({ ...emptyForm }); setEditingId(null); };

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(prev => ({ ...prev, [name]: files ? files[0] || null : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const hasFiles = form.piece_identite || form.photo_profil;
      if (editingId) {
        const { password, ...data } = form;
        await api.put(`/techniciens/${editingId}`, password ? form : data);
        showMessage('success', t('admin.technician_updated'));
      } else if (hasFiles) {
        const fd = new FormData();
        Object.keys(emptyForm).forEach(key => {
          if (form[key] !== null && form[key] !== undefined) fd.append(key, form[key]);
        });
        await api.post('/techniciens', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        showMessage('success', t('admin.technician_created'));
      } else {
        await api.post('/techniciens', form);
        showMessage('success', t('admin.technician_created'));
      }
      resetForm();
      await load();
    } catch (err) {
      showMessage('error', err.response?.data?.message || t('admin.error'));
    } finally { setSubmitting(false); }
  };

  const handleEdit = (tech) => {
    setForm({ nom: tech.nom, prenom: tech.prenom, email: tech.email, telephone: tech.telephone || '', adresse: tech.adresse || '', specialite: tech.specialite || '', password: '', piece_identite: null, photo_profil: null });
    setEditingId(tech.id);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/techniciens/${id}`);
      showMessage('success', t('admin.delete_success'));
      await load();
    } catch { showMessage('error', t('admin.delete_error')); }
  };

  const fields = [
    { name: 'nom', label: t('profile.label_nom'), required: true },
    { name: 'prenom', label: t('profile.label_prenom'), required: true },
    { name: 'email', label: t('profile.label_email'), type: 'email', required: true },
    { name: 'telephone', label: t('profile.label_telephone') },
    { name: 'adresse', label: t('profile.label_adresse') },
    { name: 'specialite', label: t('profile.label_specialite'), required: true },
  ];

  const inputClass = "py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] font-body text-sm text-[var(--color-text)] bg-[var(--color-surface)]";

  if (loading) return <AdminPageLayout title={t('admin.technicians_title')} maxWidth="1000px"><LoadingSpinner /></AdminPageLayout>;

  return (
    <AdminPageLayout title={t('admin.technicians_title')} maxWidth="1000px">
      {message.text && (
        <div className={`mb-4 p-3 rounded-[var(--radius-sm)] text-sm ${message.type === 'error' ? 'bg-[var(--color-error-bg)] text-[var(--color-error)]' : 'bg-[var(--color-success-bg)] text-[var(--color-success)]'}`}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 mb-3">
          {fields.map(f => (
            <input key={f.name} name={f.name} type={f.type || 'text'} placeholder={f.label + (f.required ? ' *' : '')}
              value={form[f.name]} onChange={handleChange} required={f.required} className={inputClass} />
          ))}
          <input name="password" type="password" placeholder={editingId ? t('admin.new_password') : 'Mot de passe *'}
            value={form.password} onChange={handleChange} required={!editingId} className={inputClass} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[var(--color-text)]">{t('admin.identity_doc')}</label>
            <input name="piece_identite" type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleChange}
              className={`${inputClass} file:mr-3 file:py-1 file:px-3 file:rounded-[var(--radius-sm)] file:border-none file:bg-[var(--color-primary)] file:text-white file:text-xs file:font-semibold file:cursor-pointer`} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[var(--color-text)]">{t('profile.photo_title')}</label>
            <input name="photo_profil" type="file" accept=".png,.jpg,.jpeg,.webp" onChange={handleChange}
              className={`${inputClass} file:mr-3 file:py-1 file:px-3 file:rounded-[var(--radius-sm)] file:border-none file:bg-[var(--color-primary)] file:text-white file:text-xs file:font-semibold file:cursor-pointer`} />
          </div>
        </div>
        <div className="flex gap-3">
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
            <tr><th className="text-left p-2">{t('profile.label_nom')}</th><th className="text-left p-2">{t('profile.label_prenom')}</th><th className="text-left p-2">{t('profile.label_email')}</th><th className="text-left p-2">{t('profile.label_telephone')}</th><th className="text-left p-2">{t('profile.label_specialite')}</th><th className="text-left p-2">{t('admin.actions_col')}</th></tr>
          </thead>
          <tbody>
            {techniciens.map(tech => (
              <tr key={tech.id} className="border-t border-[var(--color-border)]">
                <td className="p-2">{tech.nom}</td>
                <td className="p-2">{tech.prenom}</td>
                <td className="p-2">{tech.email}</td>
                <td className="p-2">{tech.telephone || '—'}</td>
                <td className="p-2">{tech.specialite || '—'}</td>
                <td className="p-2">
                  <button onClick={() => handleEdit(tech)}
                    className="py-[6px] px-4 bg-[var(--color-primary)] text-white border-none rounded-[var(--radius-sm)] font-body text-[var(--text-xs)] cursor-pointer mr-1">{t('admin.edit')}</button>
                  <button onClick={() => handleDelete(tech.id)}
                    className="py-[6px] px-3 bg-[var(--color-error)] text-white border-none rounded-[var(--radius-sm)] font-body text-[var(--text-xs)] cursor-pointer">{t('admin.delete')}</button>
                </td>
              </tr>
            ))}
            {techniciens.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-[var(--color-text-muted)]">{t('admin.empty_technicians')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminPageLayout>
  );
}
