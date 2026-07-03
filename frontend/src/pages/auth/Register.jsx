import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import InputField from '../../components/forms/InputField';
import PasswordField from '../../components/forms/PasswordField';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { MailIcon } from '../../components/ui/Icons';

const NAME_PATTERN = /^[a-zA-ZÀ-ÿa-zA-Z\s\-']+$/;
const TELEPHONE_PATTERN = /^[+\d][\d\s\-().]{6,20}$/;

export default function Register() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.id]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.nom.trim()) newErrors.nom = t('auth.name_required');
    else if (form.nom.length > 100) newErrors.nom = 'Le nom ne doit pas dépasser 100 caractères';
    else if (!NAME_PATTERN.test(form.nom)) newErrors.nom = 'Le nom contient des caractères non autorisés';
    if (!form.prenom.trim()) newErrors.prenom = t('auth.firstname_required');
    else if (form.prenom.length > 100) newErrors.prenom = 'Le prénom ne doit pas dépasser 100 caractères';
    else if (!NAME_PATTERN.test(form.prenom)) newErrors.prenom = 'Le prénom contient des caractères non autorisés';
    if (!form.email.trim()) newErrors.email = t('auth.email_required');
    if (form.telephone && !TELEPHONE_PATTERN.test(form.telephone)) newErrors.telephone = 'Format de téléphone invalide';
    if (!form.password) newErrors.password = t('auth.password_required');
    else if (form.password.length < 8) newErrors.password = t('auth.min_password');
    else if (!/[A-Z]/.test(form.password)) newErrors.password = 'Le mot de passe doit contenir une majuscule';
    else if (!/[0-9]/.test(form.password)) newErrors.password = 'Le mot de passe doit contenir un chiffre';
    else if (!/[^A-Za-z0-9]/.test(form.password)) newErrors.password = 'Le mot de passe doit contenir un caractère spécial';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await register(form);
      navigate('/client/dashboard', { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        const fieldErrors = {};
        data.errors.forEach(e => {
          if (e.field) fieldErrors[e.field] = e.message;
        });
        if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
      }
      if (err.response?.status >= 500) console.error('[Register Error]', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-background)' }}>
      <div
        className="w-full max-w-md p-8 max-sm:p-6 rounded-[var(--radius-lg)]"
        style={{
          background: 'var(--color-surface)',
          boxShadow: 'var(--shadow-md)',
          animation: 'fadeSlideUp 0.4s ease',
        }}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl max-sm:text-xl font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
            {t('auth.register_title')}
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {t('auth.register_subtitle')}
          </p>
        </div>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex gap-4 max-sm:flex-col">
            <div className="flex-1">
              <InputField
                id="nom"
                label="Nom"
                placeholder="Votre nom"
                value={form.nom}
                onChange={handleChange}
                error={errors.nom}
              />
            </div>
            <div className="flex-1">
              <InputField
                id="prenom"
                label="Prénom"
                placeholder="Votre prénom"
                value={form.prenom}
                onChange={handleChange}
                error={errors.prenom}
              />
            </div>
          </div>

          <InputField
            id="email"
            label="Email"
            type="email"
            placeholder="votre@email.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            icon={MailIcon}
          />

          <InputField
            id="telephone"
            label="Téléphone (optionnel)"
            type="tel"
            placeholder="+212 6XX XXX XXX"
            value={form.telephone}
            onChange={handleChange}
            error={errors.telephone}
          />

          <PasswordField
            id="password"
            label="Mot de passe"
            placeholder="Minimum 8 caractères"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            showStrength
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 border-none rounded-[var(--radius-md)] text-base font-semibold cursor-pointer transition-all duration-[var(--transition-fast)] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: submitting ? 'var(--color-text-muted)' : 'var(--color-primary)',
              color: '#fff',
            }}
          >
            {submitting ? t('auth.register_loading') : t('auth.register_submit')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {t('auth.have_account')}{' '}
          <Link to="/login" style={{ color: 'var(--color-secondary)', fontWeight: 600, textDecoration: 'none' }}>
            {t('auth.sign_in')}
          </Link>
        </p>
      </div>
    </div>
  );
}
