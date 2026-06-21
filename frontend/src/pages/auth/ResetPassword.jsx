import { useState } from 'react';
import { Link } from 'react-router-dom';
import InputField from '../../components/forms/InputField';
import PasswordField from '../../components/forms/PasswordField';
import ErrorMessage from '../../components/ui/ErrorMessage';
import api from '../../services/authService';

export default function ResetPassword() {
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
      newErrors.code = 'Code à 6 chiffres requis';
    }

    if (!password) {
      newErrors.password = 'Mot de passe requis';
    } else if (password.length < 8) {
      newErrors.password = 'Minimum 8 caractères';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
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
      setApiError(data?.message || 'Erreur lors de la réinitialisation');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-background)' }}>
        <div
          className="w-full max-w-md p-8 rounded-[var(--radius-lg)]"
          style={{
            background: 'var(--color-surface)',
            boxShadow: 'var(--shadow-md)',
            animation: 'fadeSlideUp 0.4s ease',
          }}
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
              Mot de passe réinitialisé
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Votre mot de passe a été modifié avec succès.
            </p>
          </div>
          <div className="text-center">
            <Link to="/login"
              style={{ color: 'var(--color-secondary)', fontWeight: 600, textDecoration: 'none' }}
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-background)' }}>
      <div
        className="w-full max-w-md p-8 rounded-[var(--radius-lg)]"
        style={{
          background: 'var(--color-surface)',
          boxShadow: 'var(--shadow-md)',
          animation: 'fadeSlideUp 0.4s ease',
        }}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
            Réinitialisation
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Saisissez le code reçu par email et votre nouveau mot de passe
          </p>
        </div>

        <ErrorMessage message={apiError} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <InputField
            id="code"
            label="Code de réinitialisation"
            type="text"
            placeholder="000000"
            maxLength={6}
            value={code}
            onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setErrors(prev => ({ ...prev, code: '' })); }}
            error={errors.code}
          />

          <PasswordField
            id="password"
            label="Nouveau mot de passe"
            placeholder="Minimum 8 caractères"
            value={password}
            showStrength
            onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
            error={errors.password}
          />

          <PasswordField
            id="confirmPassword"
            label="Confirmer le mot de passe"
            placeholder="Répétez le mot de passe"
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
            {submitting ? 'Réinitialisation...' : 'Réinitialiser'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <Link to="/forgot-password" style={{ color: 'var(--color-secondary)', fontWeight: 600, textDecoration: 'none' }}>
            Renvoyer un code
          </Link>
        </p>
      </div>
    </div>
  );
}
