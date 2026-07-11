import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { getUploadUrl } from '../../utils/uploads';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { t } = useTranslation();
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', adresse: '', specialite: '' });
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        adresse: user.adresse || '',
        specialite: user.specialite || '',
      });
    }
  }, [user]);

  const roles = user?.roles || [];
  const isAdmin = roles.includes('admin');
  const isTechnicien = roles.includes('technicien');
  const roleLabel = isAdmin ? t('profile.role_admin') : isTechnicien ? t('profile.role_technician') : t('profile.role_client');
  const avatarSrc = getUploadUrl(user?.photo_profil);
  const displayName = [user?.prenom, user?.nom].filter(Boolean).join(' ');

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.nom.trim()) { toast.error(t('profile.error_nom_required')); return; }
    if (form.nom.length > 100) { toast.error(t('profile.error_nom_max')); return; }
    if (!isAdmin && !form.prenom.trim()) { toast.error(t('profile.error_prenom_required')); return; }
    if (!isAdmin && form.prenom.length > 100) { toast.error(t('profile.error_prenom_max')); return; }
    if (!form.email.trim()) { toast.error(t('profile.error_email_required')); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error(t('profile.error_email_format')); return; }
    if (!isAdmin && form.telephone && !/^[+\d][\d\s\-().]{6,20}$/.test(form.telephone)) { toast.error(t('profile.error_telephone_format')); return; }
    if (!isAdmin && form.adresse && form.adresse.length > 255) { toast.error(t('profile.error_adresse_max')); return; }
    if (isTechnicien && form.specialite && form.specialite.length > 100) { toast.error(t('profile.error_specialite_max')); return; }

    const payload = { email: form.email };

    if (isAdmin) {
      payload.nom = form.nom;
    } else if (isTechnicien) {
      payload.nom = form.nom;
      payload.prenom = form.prenom;
      payload.telephone = form.telephone || null;
      payload.adresse = form.adresse || null;
      payload.specialite = form.specialite || null;
    } else {
      payload.nom = form.nom;
      payload.prenom = form.prenom;
      payload.telephone = form.telephone || null;
      payload.adresse = form.adresse || null;
    }

    setLoading(true);
    try {
      const res = await api.put('/users/profile', payload);
      if (setUser) setUser(res.data.data?.user);
      toast.success(t('profile.update_success'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('profile.update_error'));
    } finally { setLoading(false); }
  };

  const handleAvatar = async e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error(t('profile.error_file_size')); return; }
    setAvatarLoading(true);
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const res = await api.post('/users/profile/avatar', fd);
      const updatedUser = res.data.data?.user;
      if (setUser && updatedUser) setUser(updatedUser);
      toast.success(t('profile.photo_updated'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('profile.update_error'));
    } finally { setAvatarLoading(false); }
  };

  return (
    <div className="max-w-[800px] mx-auto">
      <h1 className="font-display text-[var(--text-xl)] font-bold text-[var(--color-text)] m-0 mb-6">{t('profile.title')}</h1>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-8 mb-6">
        <div className="flex items-center gap-6 mb-8 flex-wrap">
          <div className="relative">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-3 border-[var(--color-primary)]" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-3xl text-white font-bold">
                {(user?.nom?.[0] || user?.prenom?.[0] || '').toUpperCase()}
              </div>
            )}
            <label className={`absolute bottom-0 right-0 w-8 h-8 bg-[var(--color-secondary)] rounded-full flex items-center justify-center cursor-pointer border-2 border-white hover:bg-[var(--color-secondary-hover)] transition-colors ${avatarLoading ? 'opacity-50 pointer-events-none' : ''}`}>
              {avatarLoading ? (
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              )}
              <input type="file" accept=".png,.jpg,.jpeg,.webp" onChange={handleAvatar} className="hidden" />
            </label>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)] m-0">{displayName || user?.email}</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1 m-0">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-semibold rounded-full">{roleLabel}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[var(--color-text)]">{t('profile.label_nom')}</label>
            <input name="nom" value={form.nom} onChange={handleChange} required
              className="w-full py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] font-body text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-secondary)]" />
          </div>
          {!isAdmin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[var(--color-text)]">{t('profile.label_prenom')}</label>
              <input name="prenom" value={form.prenom} onChange={handleChange} required
                className="w-full py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] font-body text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-secondary)]" />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[var(--color-text)]">{t('profile.label_email')}</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required
              className="w-full py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] font-body text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-secondary)]" />
          </div>
          {!isAdmin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[var(--color-text)]">{t('profile.label_telephone')}</label>
              <input name="telephone" value={form.telephone} onChange={handleChange}
                className="w-full py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] font-body text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-secondary)]" />
            </div>
          )}
          {!isAdmin && (
            <div className="flex flex-col gap-1.5 col-span-2 max-md:col-span-1">
              <label className="text-sm font-semibold text-[var(--color-text)]">{t('profile.label_adresse')}</label>
              <input name="adresse" value={form.adresse} onChange={handleChange}
                className="w-full py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] font-body text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-secondary)]" />
            </div>
          )}
          {isTechnicien && (
            <div className="flex flex-col gap-1.5 col-span-2 max-md:col-span-1">
              <label className="text-sm font-semibold text-[var(--color-text)]">{t('profile.label_specialite')}</label>
              <input name="specialite" value={form.specialite} onChange={handleChange}
                className="w-full py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] font-body text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-secondary)]" />
            </div>
          )}
          <div className="col-span-2 max-md:col-span-1 pt-2">
            <button type="submit" disabled={loading}
              className="py-[13px] px-8 bg-[var(--color-secondary)] text-white border-none rounded-[var(--radius-md)] font-body text-base font-semibold cursor-pointer transition-[background] hover:bg-[var(--color-secondary-hover)] disabled:opacity-50">
              {loading ? t('profile.saving') : t('profile.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
