import { useState, useEffect } from 'react';
import api from '../../services/authService';
import AdminPageLayout from '../../components/layout/AdminPageLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const emptyForm = { nom: '', email: '', password: '' };

export default function GestionAdministrateurs() {
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
      showMessage('error', 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ ...emptyForm }); setEditingId(null); };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        const { password, ...data } = form;
        await api.put(`/administrateurs/${editingId}`, password ? form : data);
        showMessage('success', 'Administrateur mis à jour');
      } else {
        await api.post('/administrateurs', { ...form, role: 'admin' });
        showMessage('success', 'Administrateur créé');
      }
      resetForm();
      await load();
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Erreur');
    } finally { setSubmitting(false); }
  };

  const handleEdit = (admin) => {
    setForm({ nom: admin.nom, email: admin.email, password: '' });
    setEditingId(admin.id);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/administrateurs/${id}`);
      showMessage('success', 'Administrateur supprimé');
      await load();
    } catch { showMessage('error', 'Erreur lors de la suppression'); }
  };

  const inputClass = "py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] font-body text-sm text-[var(--color-text)] bg-[var(--color-surface)]";

  if (loading) return <AdminPageLayout title="Gestion des administrateurs"><LoadingSpinner /></AdminPageLayout>;

  return (
    <AdminPageLayout title="Gestion des administrateurs">
      {message.text && (
        <div className={`mb-4 p-3 rounded-[var(--radius-sm)] text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-3 items-end flex-wrap">
          <input name="nom" placeholder="Nom *" value={form.nom} onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))} required className={inputClass} />
          <input name="email" type="email" placeholder="Email *" value={form.email} onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))} required className={inputClass} />
          <input name="password" type="password" placeholder={editingId ? "Nouveau mot de passe" : "Mot de passe *"} value={form.password} onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))} required={!editingId} className={inputClass} />
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
            <tr><th className="text-left p-2">Nom</th><th className="text-left p-2">Email</th><th className="text-left p-2">Rôle</th><th className="text-left p-2">Actions</th></tr>
          </thead>
          <tbody>
            {admins.map(a => (
              <tr key={a.id} className="border-t border-[var(--color-border)]">
                <td className="p-2">{a.nom}</td>
                <td className="p-2">{a.email}</td>
                <td className="p-2">{a.role}</td>
                <td className="p-2">
                  <button onClick={() => handleEdit(a)}
                    className="py-[6px] px-4 bg-[var(--color-primary)] text-white border-none rounded-[var(--radius-sm)] font-body text-[var(--text-xs)] cursor-pointer mr-1">Modifier</button>
                  <button onClick={() => handleDelete(a.id)}
                    className="py-[6px] px-3 bg-[var(--color-error)] text-white border-none rounded-[var(--radius-sm)] font-body text-[var(--text-xs)] cursor-pointer">Supprimer</button>
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr><td colSpan={4} className="text-center py-8 text-[var(--color-text-muted)]">Aucun administrateur</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminPageLayout>
  );
}
