import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardPath } from '../../utils/dashboard';
import InputField from '../../components/forms/InputField';
import PasswordField from '../../components/forms/PasswordField';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { MailIcon } from '../../components/ui/Icons';

export default function Login() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.id]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.email) newErrors.email = t('auth.email_required');
    if (!form.password) newErrors.password = t('auth.password_required');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const result = await login(form.email, form.password);
      const path = from || getDashboardPath(result.data.user.role);
      navigate(path, { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        const fieldErrors = {};
        data.errors.forEach(e => {
          if (e.field) fieldErrors[e.field] = e.message;
        });
        if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
      }
      if (err.response?.status >= 500) console.error('[Login Error]', err);
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
            {t('auth.login_title')}
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {t('auth.login_subtitle')}
          </p>
        </div>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

          <PasswordField
            id="password"
            label="Mot de passe"
            placeholder="Votre mot de passe"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
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
            {submitting ? t('auth.login_loading') : t('auth.login_submit')}
          </button>

          <div className="text-center">
            <Link to="/forgot-password" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', textDecoration: 'none' }}>
              {t('auth.forgot_password')}
            </Link>
          </div>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {t('auth.no_account')}{' '}
          <Link to="/register" style={{ color: 'var(--color-secondary)', fontWeight: 600, textDecoration: 'none' }}>
            {t('auth.sign_up')}
          </Link>
        </p>
      </div>
    </div>
  );
}
