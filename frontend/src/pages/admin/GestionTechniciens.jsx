import { useState, useEffect } from 'react';
import api from '../../services/authService';
import AdminPageLayout from '../../components/layout/AdminPageLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const emptyForm = {
  nom: '', prenom: '', email: '', telephone: '',
  adresse: '', specialite: '', password: '',
  piece_identite: null, photo_profil: null,
};

export default function GestionTechniciens() {
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
      showMessage('error', 'Erreur lors du chargement');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

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
        showMessage('success', 'Technicien mis à jour');
      } else if (hasFiles) {
        const fd = new FormData();
        Object.keys(emptyForm).forEach(key => {
          if (form[key] !== null && form[key] !== undefined) fd.append(key, form[key]);
        });
        await api.post('/techniciens', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        showMessage('success', 'Technicien créé');
      } else {
        await api.post('/techniciens', form);
        showMessage('success', 'Technicien créé');
      }
      resetForm();
      await load();
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Erreur');
    } finally { setSubmitting(false); }
  };

  const handleEdit = (t) => {
    setForm({ nom: t.nom, prenom: t.prenom, email: t.email, telephone: t.telephone || '', adresse: t.adresse || '', specialite: t.specialite || '', password: '', piece_identite: null, photo_profil: null });
    setEditingId(t.id);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/techniciens/${id}`);
      showMessage('success', 'Technicien supprimé');
      await load();
    } catch { showMessage('error', 'Erreur lors de la suppression'); }
  };

  const fields = [
    { name: 'nom', label: 'Nom *', required: true },
    { name: 'prenom', label: 'Prénom *', required: true },
    { name: 'email', label: 'Email *', type: 'email', required: true },
    { name: 'telephone', label: 'Téléphone' },
    { name: 'adresse', label: 'Adresse' },
    { name: 'specialite', label: 'Spécialité *', required: true },
  ];

  const inputClass = "py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] font-body text-sm text-[var(--color-text)] bg-[var(--color-surface)]";

  if (loading) return <AdminPageLayout title="Gestion des techniciens" maxWidth="1000px"><LoadingSpinner /></AdminPageLayout>;

  return (
    <AdminPageLayout title="Gestion des techniciens" maxWidth="1000px">
      {message.text && (
        <div className={`mb-4 p-3 rounded-[var(--radius-sm)] text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 mb-3">
          {fields.map(f => (
            <input key={f.name} name={f.name} type={f.type || 'text'} placeholder={f.label}
              value={form[f.name]} onChange={handleChange} required={f.required} className={inputClass} />
          ))}
          <input name="password" type="password" placeholder={editingId ? "Nouveau mot de passe" : "Mot de passe *"}
            value={form.password} onChange={handleChange} required={!editingId} className={inputClass} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[var(--color-text)]">Pièce d'identité</label>
            <input name="piece_identite" type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleChange}
              className={`${inputClass} file:mr-3 file:py-1 file:px-3 file:rounded-[var(--radius-sm)] file:border-none file:bg-[var(--color-primary)] file:text-white file:text-xs file:font-semibold file:cursor-pointer`} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[var(--color-text)]">Photo de profil</label>
            <input name="photo_profil" type="file" accept=".png,.jpg,.jpeg,.webp" onChange={handleChange}
              className={`${inputClass} file:mr-3 file:py-1 file:px-3 file:rounded-[var(--radius-sm)] file:border-none file:bg-[var(--color-primary)] file:text-white file:text-xs file:font-semibold file:cursor-pointer`} />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={submitting}
            className="py-[11px] px-5 bg-[var(--color-primary)] text-white border-none rounded-[var(--radius-md)] font-body text-sm font-semibold cursor-pointer whitespace-nowrap disabled:opacity-50">
            {submitting ? '...' : editingId ? 'Modifier' : 'Ajouter'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm}
              className="py-[11px] px-4 bg-[var(--color-background)] text-[var(--color-text)] border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] font-body text-sm cursor-pointer whitespace-nowrap">
              Annuler
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[var(--text-xs)]">
          <thead>
            <tr><th className="text-left p-2">Nom</th><th className="text-left p-2">Prénom</th><th className="text-left p-2">Email</th><th className="text-left p-2">Téléphone</th><th className="text-left p-2">Spécialité</th><th className="text-left p-2">Actions</th></tr>
          </thead>
          <tbody>
            {techniciens.map(t => (
              <tr key={t.id} className="border-t border-[var(--color-border)]">
                <td className="p-2">{t.nom}</td>
                <td className="p-2">{t.prenom}</td>
                <td className="p-2">{t.email}</td>
                <td className="p-2">{t.telephone || '—'}</td>
                <td className="p-2">{t.specialite || '—'}</td>
                <td className="p-2">
                  <button onClick={() => handleEdit(t)}
                    className="py-[6px] px-4 bg-[var(--color-primary)] text-white border-none rounded-[var(--radius-sm)] font-body text-[var(--text-xs)] cursor-pointer mr-1">Modifier</button>
                  <button onClick={() => handleDelete(t.id)}
                    className="py-[6px] px-3 bg-[var(--color-error)] text-white border-none rounded-[var(--radius-sm)] font-body text-[var(--text-xs)] cursor-pointer">Supprimer</button>
                </td>
              </tr>
            ))}
            {techniciens.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-[var(--color-text-muted)]">Aucun technicien</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminPageLayout>
  );
}
