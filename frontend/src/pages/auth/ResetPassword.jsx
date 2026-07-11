import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import InputField from '../../components/forms/InputField';
import PasswordField from '../../components/forms/PasswordField';
import ErrorMessage from '../../components/ui/ErrorMessage';
import api from '../../services/api';

export default function ResetPassword() {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!code || code.length !== 6) {
      newErrors.code = t('auth.reset_code_required');
    }

    if (!password) {
      newErrors.password = t('auth.password_required');
    } else if (password.length < 8) {
      newErrors.password = t('auth.min_password');
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Le mot de passe doit contenir une majuscule';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Le mot de passe doit contenir un chiffre';
    } else if (!/[^A-Za-z0-9]/.test(password)) {
      newErrors.password = 'Le mot de passe doit contenir un caractère spécial';
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
      await api.post('/auth/reset-password', { token: code, password });
      setSuccess(true);
    } catch (err) {
      const data = err.response?.data;
      setApiError(data?.message || t('auth.reset_error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
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
              {t('auth.reset_success_title')}
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {t('auth.reset_success_text')}
            </p>
          </div>
          <div className="text-center">
            <Link to="/login"
              style={{ color: 'var(--color-secondary)', fontWeight: 600, textDecoration: 'none' }}
            >
              {t('auth.sign_in')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            {t('auth.reset_title')}
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {t('auth.reset_subtitle')}
          </p>
        </div>

        <ErrorMessage message={apiError} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <InputField
            id="code"
            label={t('auth.reset_code_label')}
            type="text"
            placeholder="000000"
            maxLength={6}
            value={code}
            onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setErrors(prev => ({ ...prev, code: '' })); }}
            error={errors.code}
          />

          <PasswordField
            id="password"
            label={t('auth.reset_new_password')}
            placeholder={t('auth.min_password')}
            value={password}
            showStrength
            onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
            error={errors.password}
          />

          <PasswordField
            id="confirmPassword"
            label={t('auth.reset_confirm_password')}
            placeholder={t('auth.reset_confirm_password')}
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: '' })); }}
            error={errors.confirmPassword}
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
            {submitting ? t('auth.reset_loading') : t('auth.reset_submit')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <Link to="/forgot-password" style={{ color: 'var(--color-secondary)', fontWeight: 600, textDecoration: 'none' }}>
            {t('auth.send_code_again')}
          </Link>
        </p>
      </div>
    </div>
  );
}
