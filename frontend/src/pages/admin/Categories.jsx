import { useState, useEffect } from 'react';
import api from '../../services/authService';
import AdminPageLayout from '../../components/layout/AdminPageLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function Categories() {
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
      setCategories(res.data.data || []);
    } catch {
      showMessage('error', 'Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ nom: '', description: '' }); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom.trim()) return showMessage('error', 'Le nom est requis');
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
        showMessage('success', 'Catégorie mise à jour');
      } else {
        await api.post('/categories', form);
        showMessage('success', 'Catégorie créée');
      }
      resetForm();
      await load();
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Erreur');
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
      showMessage('success', 'Catégorie supprimée');
      await load();
      if (editingId === id) resetForm();
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const inputClass = "py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] font-body text-sm text-[var(--color-text)] bg-[var(--color-surface)]";

  if (loading) return <AdminPageLayout title="Gestion des catégories"><LoadingSpinner /></AdminPageLayout>;

  return (
    <AdminPageLayout title="Gestion des catégories">
      {message.text && (
        <div className={`mb-4 p-3 rounded-[var(--radius-sm)] text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-6 flex-wrap">
        <input placeholder="Nom de la catégorie *" value={form.nom}
          onChange={e => setForm(prev => ({ ...prev, nom: e.target.value }))} required
          className={`${inputClass} flex-[1_0_180px]`} />
        <input placeholder="Description" value={form.description}
          onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
          className={`${inputClass} flex-[1_0_180px]`} />
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
      </form>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[var(--text-xs)]">
          <thead>
            <tr><th className="text-left p-2">Nom</th><th className="text-left p-2">Description</th><th className="text-left p-2">Actions</th></tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id} className="border-t border-[var(--color-border)]">
                <td className="p-2">{c.nom}</td>
                <td className="p-2">{c.description || '—'}</td>
                <td className="p-2">
                  <button onClick={() => handleEdit(c)}
                    className="py-[6px] px-4 bg-[var(--color-primary)] text-white border-none rounded-[var(--radius-sm)] font-body text-[var(--text-xs)] cursor-pointer mr-1">
                    Modifier
                  </button>
                  <button onClick={() => handleDelete(c.id)}
                    className="py-[6px] px-3 bg-[var(--color-error)] text-white border-none rounded-[var(--radius-sm)] font-body text-[var(--text-xs)] cursor-pointer">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={3} className="text-center py-8 text-[var(--color-text-muted)]">Aucune catégorie</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminPageLayout>
  );
}
