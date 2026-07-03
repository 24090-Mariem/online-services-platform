import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import AdminPageLayout from '../../components/layout/AdminPageLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const NAME_PATTERN = /^[a-zA-ZÀ-ÿa-zA-Z\s\-']+$/;
const TELEPHONE_PATTERN = /^[+\d][\d\s\-().]{6,20}$/;

const emptyForm = {
  nom: '', prenom: '', email: '', telephone: '',
  adresse: '', categorie_id: '', password: '',
  piece_identite: null, photo_profil: null,
};

const validateForm = (form, editingId) => {
  const errors = {};
  const { nom, prenom, email, telephone, password } = form;

  if (!nom.trim()) errors.nom = 'Le nom est requis';
  else if (nom.length > 100) errors.nom = 'Le nom ne doit pas dépasser 100 caractères';
  else if (!NAME_PATTERN.test(nom)) errors.nom = 'Le nom contient des caractères non autorisés';

  if (!prenom.trim()) errors.prenom = 'Le prénom est requis';
  else if (prenom.length > 100) errors.prenom = 'Le prénom ne doit pas dépasser 100 caractères';
  else if (!NAME_PATTERN.test(prenom)) errors.prenom = 'Le prénom contient des caractères non autorisés';

  if (!email.trim()) errors.email = "L'email est requis";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email invalide';

  if (telephone && !TELEPHONE_PATTERN.test(telephone)) errors.telephone = 'Format de téléphone invalide';

  if (!editingId) {
    if (!password) errors.password = 'Le mot de passe est requis';
    else if (password.length < 8) errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    else if (password.length > 128) errors.password = 'Le mot de passe ne doit pas dépasser 128 caractères';
    else if (!/[A-Z]/.test(password)) errors.password = 'Le mot de passe doit contenir une majuscule';
    else if (!/[0-9]/.test(password)) errors.password = 'Le mot de passe doit contenir un chiffre';
    else if (!/[^A-Za-z0-9]/.test(password)) errors.password = 'Le mot de passe doit contenir un caractère spécial';
  }

  return errors;
};

export default function GestionTechniciens() {
  const { t } = useTranslation();
  const [techniciens, setTechniciens] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [search, setSearch] = useState('');

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [techRes, catRes] = await Promise.all([
        api.get('/techniciens/all'),
        api.get('/categories'),
      ]);
      console.log('Response:', techRes);
      const techPayload = techRes.data?.data ?? [];
      console.log('Data:', techPayload);
      const techList = Array.isArray(techPayload) ? techPayload : (Array.isArray(techPayload?.data) ? techPayload.data : []);
      console.log('Is Array:', Array.isArray(techList));
      setTechniciens(techList);

      console.log('Response:', catRes);
      const catPayload = catRes.data?.data ?? [];
      console.log('Data:', catPayload);
      const catList = Array.isArray(catPayload) ? catPayload : (Array.isArray(catPayload?.data) ? catPayload.data : []);
      console.log('Is Array:', Array.isArray(catList));
      setCategories(catList);
    } catch {
      showMessage('error', t('admin.load_error_generic'));
    } finally { setLoading(false); }
  };

  useEffect(() => {
    (async () => { await load(); })();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return techniciens;
    const q = search.toLowerCase();
    return techniciens.filter(t =>
      (t.nom || '').toLowerCase().includes(q) ||
      (t.prenom || '').toLowerCase().includes(q) ||
      (t.email || '').toLowerCase().includes(q)
    );
  }, [techniciens, search]);

  const resetForm = () => { setForm({ ...emptyForm }); setEditingId(null); setErrors({}); };

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(prev => ({ ...prev, [name]: files ? files[0] || null : value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validationErrors = validateForm(form, editingId);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    try {
      const cat = categories.find(c => String(c.id) === String(form.categorie_id));
      const payload = {
        ...form,
        specialite: cat ? cat.nom : form.specialite,
        categorie_id: undefined,
      };
      if (editingId) {
          const data = { ...payload };
          delete data.password; delete data.categorie_id; delete data.piece_identite; delete data.photo_profil;
          await api.put(`/techniciens/${editingId}`, form.password ? { ...data, password: form.password } : data);
        showMessage('success', t('admin.technician_updated'));
      } else {
        const fd = new FormData();
        Object.keys(payload).forEach(key => {
          if (payload[key] !== null && payload[key] !== undefined && key !== 'categorie_id') {
            fd.append(key, payload[key]);
          }
        });
        await api.post('/techniciens', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        showMessage('success', t('admin.technician_created'));
      }
      resetForm();
      await load();
    } catch (err) {
      showMessage('error', err.response?.data?.message || t('admin.error'));
    } finally { setSubmitting(false); }
  };

  const handleEdit = (tech) => {
    const cat = categories.find(c => c.nom === tech.specialite);
    setForm({
      nom: tech.nom, prenom: tech.prenom, email: tech.email,
      telephone: tech.telephone || '', adresse: tech.adresse || '',
      categorie_id: cat ? String(cat.id) : '',
      password: '', piece_identite: null, photo_profil: null,
    });
    setEditingId(tech.id);
    setErrors({});
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/techniciens/${id}`);
      showMessage('success', t('admin.delete_success'));
      await load();
    } catch { showMessage('error', t('admin.delete_error')); }
  };

  const inputClass = "w-full py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] font-body text-sm text-[var(--color-text)] bg-[var(--color-surface)]";
  const inputErrorClass = "w-full py-[11px] px-3 border-[1.5px] border-[var(--color-error)] rounded-[var(--radius-md)] font-body text-sm text-[var(--color-text)] bg-[var(--color-surface)]";
  if (loading) return <AdminPageLayout title={t('admin.technicians_title')} maxWidth="1000px"><LoadingSpinner /></AdminPageLayout>;

  return (
    <AdminPageLayout title={t('admin.technicians_title')} maxWidth="1000px">
      {message.text && (
        <div className={`mb-4 p-3 rounded-[var(--radius-sm)] text-sm ${message.type === 'error' ? 'bg-[var(--color-error-bg)] text-[var(--color-error)]' : 'bg-[var(--color-success-bg)] text-[var(--color-success)]'}`}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3 mb-3">
          <div className="flex flex-col">
            <input name="nom" placeholder={t('profile.label_nom') + ' *'} value={form.nom} onChange={handleChange} required className={errors.nom ? inputErrorClass : inputClass} />
            {errors.nom && <span className="text-xs text-[var(--color-error)]">{errors.nom}</span>}
          </div>
          <div className="flex flex-col">
            <input name="prenom" placeholder={t('profile.label_prenom') + ' *'} value={form.prenom} onChange={handleChange} required className={errors.prenom ? inputErrorClass : inputClass} />
            {errors.prenom && <span className="text-xs text-[var(--color-error)]">{errors.prenom}</span>}
          </div>
          <div className="flex flex-col">
            <input name="email" type="email" placeholder={t('profile.label_email') + ' *'} value={form.email} onChange={handleChange} required className={errors.email ? inputErrorClass : inputClass} />
            {errors.email && <span className="text-xs text-[var(--color-error)]">{errors.email}</span>}
          </div>
          <div className="flex flex-col">
            <input name="telephone" placeholder={t('profile.label_telephone')} value={form.telephone} onChange={handleChange} className={errors.telephone ? inputErrorClass : inputClass} />
            {errors.telephone && <span className="text-xs text-[var(--color-error)]">{errors.telephone}</span>}
          </div>
          <div className="flex flex-col">
            <input name="adresse" placeholder={t('profile.label_adresse')} value={form.adresse} onChange={handleChange} className={inputClass} />
          </div>
          <div className="flex flex-col">
          <select name="categorie_id" value={form.categorie_id} onChange={handleChange} required className={inputClass}>
            <option value="">{t('admin.select_specialite')}</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select></div>
          <div className="flex flex-col">
            <input name="password" type="password" placeholder={editingId ? t('admin.new_password') : 'Mot de passe *'} value={form.password} onChange={handleChange} required={!editingId} className={errors.password ? inputErrorClass : inputClass} />
            {errors.password && <span className="text-xs text-[var(--color-error)]">{errors.password}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[var(--color-text)]">{t('admin.identity_doc')}</label>
            <input name="piece_identite" type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleChange} className={`${inputClass} file:mr-3 file:py-1 file:px-3 file:rounded-[var(--radius-sm)] file:border-none file:bg-[var(--color-primary)] file:text-white file:text-xs file:font-semibold file:cursor-pointer`} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[var(--color-text)]">{t('profile.photo_title')}</label>
            <input name="photo_profil" type="file" accept=".png,.jpg,.jpeg,.webp" onChange={handleChange} className={`${inputClass} file:mr-3 file:py-1 file:px-3 file:rounded-[var(--radius-sm)] file:border-none file:bg-[var(--color-primary)] file:text-white file:text-xs file:font-semibold file:cursor-pointer`} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
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

      <div className="mb-4">
        <input
          placeholder={t('admin.search_placeholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`${inputClass} w-full max-w-sm`}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full border-collapse text-[var(--text-xs)]">
          <thead>
            <tr><th className="text-left p-2">{t('profile.label_nom')}</th><th className="text-left p-2">{t('profile.label_prenom')}</th><th className="text-left p-2">{t('profile.label_email')}</th><th className="text-left p-2">{t('profile.label_telephone')}</th><th className="text-left p-2">{t('profile.label_specialite')}</th><th className="text-left p-2">{t('admin.actions_col')}</th></tr>
          </thead>
          <tbody>
            {filtered.map(tech => (
              <tr key={tech.id} className="border-t border-[var(--color-border)]">
                <td className="p-2">{tech.nom}</td>
                <td className="p-2">{tech.prenom}</td>
                <td className="p-2">{tech.email}</td>
                <td className="p-2">{tech.telephone || '\u2014'}</td>
                <td className="p-2">{tech.specialite || '\u2014'}</td>
                <td className="p-2">
  <div className="flex flex-wrap gap-2">
    <button
      onClick={() => handleEdit(tech)}
      className="py-[6px] px-4 bg-[var(--color-primary)] text-white border-none rounded-[var(--radius-sm)] font-body text-[var(--text-xs)] cursor-pointer"
    >
      {t('admin.edit')}
    </button>

    <button
      onClick={() => handleDelete(tech.id)}
      className="py-[6px] px-3 bg-[var(--color-error)] text-white border-none rounded-[var(--radius-sm)] font-body text-[var(--text-xs)] cursor-pointer"
    >
      {t('admin.delete')}
    </button>
  </div>
</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-[var(--color-text-muted)]">{t('admin.empty_technicians')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminPageLayout>
  );
}
