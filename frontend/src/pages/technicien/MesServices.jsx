import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function MesServices() {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ categorie_id: '', titre: '', description: '', prix: '', duree: '' });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, cRes] = await Promise.all([
        api.get('/services/mine'),
        api.get('/categories'),
      ]);
      console.log('Response:', sRes);
      const sPayload = sRes.data?.data ?? [];
      console.log('Data:', sPayload);
      const sList = Array.isArray(sPayload) ? sPayload : (Array.isArray(sPayload?.data) ? sPayload.data : []);
      console.log('Is Array:', Array.isArray(sList));
      setServices(sList);

      console.log('Response:', cRes);
      const cPayload = cRes.data?.data ?? [];
      console.log('Data:', cPayload);
      const cList = Array.isArray(cPayload) ? cPayload : (Array.isArray(cPayload?.data) ? cPayload.data : []);
      console.log('Is Array:', Array.isArray(cList));
      setCategories(cList);
    } catch {
      toast.error('Erreur lors du chargement');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    (async () => { await load(); })();
  }, []);

  const resetForm = () => {
    setForm({ categorie_id: '', titre: '', description: '', prix: '', duree: '' });
    setImageFile(null);
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (s) => {
    setForm({ categorie_id: s.categorie_id, titre: s.titre, description: s.description || '', prix: s.prix || '', duree: s.duree || '' });
    setImageFile(null);
    setEditId(s.id);
    setShowForm(true);
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append('categorie_id', form.categorie_id);
    fd.append('titre', form.titre);
    fd.append('description', form.description || '');
    fd.append('prix', form.prix || '');
    fd.append('duree', form.duree || '');
    if (imageFile) fd.append('image', imageFile);
    return fd;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = buildFormData();
      if (editId) {
        await api.put(`/services/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success(t('services.update_success'));
      } else {
        await api.post('/services', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success(t('services.create_success'));
      }
      resetForm();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || t('services.error'));
    } finally { setSubmitting(false); }
  };

  const handleDelete = async id => {
    try {
      await api.delete(`/services/${id}`);
      toast.success(t('services.delete_success'));
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || t('services.delete_error'));
    }
  };

  if (loading) return <div className="max-w-[900px] mx-auto"><LoadingSpinner /></div>;

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-[var(--text-xl)] font-bold text-[var(--color-text)] m-0">{t('services.my_title')}</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{t('services.subtitle')}</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(prev => !prev); }}
          className="py-[10px] px-5 bg-[var(--color-secondary)] text-white border-none rounded-[var(--radius-md)] font-body text-sm font-semibold cursor-pointer hover:bg-[var(--color-secondary-hover)] transition-colors">
          {t('services.new_service')}
        </button>
      </div>

      {showForm && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 mb-6">
          <h3 className="font-display text-lg font-bold text-[var(--color-text)] m-0 mb-4">{editId ? t('services.edit_title') : t('services.new_title')}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-sm font-semibold">{t('services.label_titre')}</label>
              <input value={form.titre} onChange={e => setForm(p => ({ ...p, titre: e.target.value }))} required
                className="w-full py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] text-sm outline-none focus:border-[var(--color-secondary)]" />
            </div>
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-sm font-semibold">{t('services.label_description')}</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
                className="w-full py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] text-sm outline-none focus:border-[var(--color-secondary)] resize-y" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">{t('services.label_categorie')}</label>
              <select value={form.categorie_id} onChange={e => setForm(p => ({ ...p, categorie_id: e.target.value }))} required
                className="w-full py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] text-sm outline-none focus:border-[var(--color-secondary)]">
                <option value="">{t('services.placeholder_select')}</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">{t('services.label_prix')}</label>
              <input type="number" step="0.01" min="0" value={form.prix} onChange={e => setForm(p => ({ ...p, prix: e.target.value }))}
                className="w-full py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] text-sm outline-none focus:border-[var(--color-secondary)]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">{t('services.label_duree')}</label>
              <input type="number" min="0" value={form.duree} onChange={e => setForm(p => ({ ...p, duree: e.target.value }))}
                className="w-full py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] text-sm outline-none focus:border-[var(--color-secondary)]" />
            </div>
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-sm font-semibold">{t('services.label_image')}</label>
              <input type="file" accept=".png,.jpg,.jpeg,.webp" onChange={e => setImageFile(e.target.files[0] || null)}
                className="w-full py-[10px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] text-sm outline-none file:mr-3 file:py-1.5 file:px-3 file:rounded-[var(--radius-sm)] file:border-none file:bg-[var(--color-primary)] file:text-white file:text-xs file:font-semibold file:cursor-pointer" />
            </div>
            <div className="col-span-2 flex gap-3 pt-2">
              <button type="submit" disabled={submitting}
                className="py-[10px] px-6 bg-[var(--color-secondary)] text-white border-none rounded-[var(--radius-md)] font-body text-sm font-semibold cursor-pointer hover:bg-[var(--color-secondary-hover)] disabled:opacity-50">
                {submitting ? t('services.save') : editId ? t('services.update') : t('services.create')}
              </button>
              <button type="button" onClick={resetForm}
                className="py-[10px] px-6 bg-transparent text-[var(--color-text)] border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] font-body text-sm cursor-pointer hover:bg-[var(--color-background)]">
                {t('services.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {services.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <p className="text-lg mb-2">{t('services.empty_title')}</p>
          <p className="text-sm">{t('services.empty_subtitle')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {services.map(s => (
            <div key={s.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-base font-semibold text-[var(--color-text)] m-0">{s.titre}</h3>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${s.est_actif ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]' : 'bg-[var(--color-error-bg)] text-[var(--color-error)]'}`}>
                    {s.est_actif ? t('services.active') : t('services.inactive')}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-muted)] m-0 mb-1">{s.description || t('services.no_description')}</p>
                <div className="flex gap-4 text-xs text-[var(--color-text-secondary)]">
                  <span>{t('services.category')}: {s.categorie_nom}</span>
                  {s.prix && <span>{t('services.price')}: {s.prix} MRU</span>}
                  {s.duree && <span>{t('services.duration')}: {s.duree} min</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(s)}
                  className="py-[6px] px-4 bg-transparent text-[var(--color-secondary)] border-[1.5px] border-[var(--color-secondary)] rounded-[var(--radius-sm)] text-xs font-semibold cursor-pointer hover:bg-[var(--color-secondary)] hover:text-white transition-colors">{t('services.edit')}</button>
                <button onClick={() => handleDelete(s.id)}
                  className="py-[6px] px-4 bg-transparent text-[var(--color-error)] border-[1.5px] border-[var(--color-error)] rounded-[var(--radius-sm)] text-xs font-semibold cursor-pointer hover:bg-[var(--color-error)] hover:text-white transition-colors">{t('services.delete')}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
