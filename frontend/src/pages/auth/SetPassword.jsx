import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PasswordField from '../../components/forms/PasswordField';
import ErrorMessage from '../../components/ui/ErrorMessage';
import api from '../../services/api';

export default function SetPassword() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!password || password.length < 8) {
      newErrors.password = t('auth.min_password');
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.reset_password_mismatch');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    setApiError(null);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
    } catch (err) {
      const data = err.response?.data;
      setApiError(data?.message || t('auth.reset_error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-background)' }}>
        <div className="w-full max-w-md p-8 rounded-[var(--radius-lg)] text-center" style={{ background: 'var(--color-surface)' }}>
          <h1 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>{t('auth.invalid_link')}</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>{t('auth.invalid_link_text')}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-background)' }}>
        <div className="w-full max-w-md p-8 rounded-[var(--radius-lg)]" style={{ background: 'var(--color-surface)' }}>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{t('auth.set_password_success')}</h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('auth.set_password_success_text')}</p>
          </div>
          <div className="text-center">
            <Link to="/login" style={{ color: 'var(--color-secondary)', fontWeight: 600, textDecoration: 'none' }}>
              {t('auth.sign_in')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-background)' }}>
      <div className="w-full max-w-md p-8 rounded-[var(--radius-lg)]" style={{ background: 'var(--color-surface)' }}>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{t('auth.set_password_title')}</h1>
          {email && <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>{email}</p>}
        </div>

        <ErrorMessage message={apiError} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <PasswordField
            id="password"
            label={t('auth.new_password')}
            placeholder={t('auth.min_password')}
            value={password}
            showStrength
            onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
            error={errors.password}
          />

          <PasswordField
            id="confirmPassword"
            label={t('auth.confirm_password')}
            placeholder={t('auth.confirm_password')}
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: '' })); }}
            error={errors.confirmPassword}
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 border-none rounded-[var(--radius-md)] text-base font-semibold cursor-pointer transition-all duration-[var(--transition-fast)] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: submitting ? 'var(--color-text-muted)' : 'var(--color-primary)', color: '#fff' }}
          >
            {submitting ? t('auth.set_password_loading') : t('auth.set_password_submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
