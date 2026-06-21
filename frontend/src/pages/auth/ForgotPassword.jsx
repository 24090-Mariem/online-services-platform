import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InputField from '../../components/forms/InputField';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { MailIcon } from '../../components/ui/Icons';
import api from '../../services/authService';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email requis');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.post('/auth/forgot-password', { email });
      navigate('/reset-password');
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || 'Erreur lors de la demande');
    } finally {
      setSubmitting(false);
    }
  };

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
            Mot de passe oublié
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Entrez votre email pour recevoir un code de réinitialisation
          </p>
        </div>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <InputField
            id="email"
            label="Email"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            icon={MailIcon}
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
            {submitting ? 'Envoi...' : 'Envoyer'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <Link to="/login" style={{ color: 'var(--color-secondary)', fontWeight: 600, textDecoration: 'none' }}>
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
