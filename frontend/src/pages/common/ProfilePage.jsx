import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { t } = useTranslation();
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', adresse: '', specialite: '' });
  const [loading, setLoading] = useState(false);

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

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/profile', form);
      if (setUser) setUser(res.data.data?.user);
      toast.success(t('profile.update_success'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('profile.update_error'));
    } finally { setLoading(false); }
  };

  const handleAvatar = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const res = await api.post('/users/profile/avatar', fd);
      if (setUser) setUser(res.data.data?.user);
      toast.success(t('profile.photo_updated'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('profile.update_error'));
    }
  };

  const roles = user?.roles || [];
  const roleLabel = roles.includes('admin') ? t('profile.role_admin') : roles.includes('technicien') ? t('profile.role_technician') : t('profile.role_client');
  const avatarSrc = user?.photo_profil ? `/uploads/${user.photo_profil}` : null;

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
                {(user?.prenom?.[0] || '').toUpperCase()}
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--color-secondary)] rounded-full flex items-center justify-center cursor-pointer border-2 border-white hover:bg-[var(--color-secondary-hover)] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              <input type="file" accept=".png,.jpg,.jpeg,.webp" onChange={handleAvatar} className="hidden" />
            </label>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)] m-0">{user?.prenom} {user?.nom}</h2>
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
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[var(--color-text)]">{t('profile.label_prenom')}</label>
            <input name="prenom" value={form.prenom} onChange={handleChange} required
              className="w-full py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] font-body text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-secondary)]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[var(--color-text)]">{t('profile.label_email')}</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required
              className="w-full py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] font-body text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-secondary)]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[var(--color-text)]">{t('profile.label_telephone')}</label>
            <input name="telephone" value={form.telephone} onChange={handleChange}
              className="w-full py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] font-body text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-secondary)]" />
          </div>
          <div className="flex flex-col gap-1.5 col-span-2 max-md:col-span-1">
            <label className="text-sm font-semibold text-[var(--color-text)]">{t('profile.label_adresse')}</label>
            <input name="adresse" value={form.adresse} onChange={handleChange}
              className="w-full py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] font-body text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-secondary)]" />
          </div>
          {roles.includes('technicien') && (
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
