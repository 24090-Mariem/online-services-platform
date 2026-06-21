import React, { useState } from 'react';

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', cls: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const map = [
    { label: 'Très faible', cls: 'strength-weak' },
    { label: 'Faible', cls: 'strength-weak' },
    { label: 'Moyen', cls: 'strength-fair' },
    { label: 'Bon', cls: 'strength-good' },
    { label: 'Fort', cls: 'strength-strong' },
  ];
  return { score, ...map[score] };
};

const PasswordField = React.forwardRef(
  ({ label, id, showStrength = false, error, ...rest }, ref) => {
    const [visible, setVisible] = useState(false);
    const strength = showStrength ? getPasswordStrength(rest.value || '') : null;

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-sm font-semibold text-[var(--color-text)]" htmlFor={id}>
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <span className="absolute left-4 text-[var(--color-text-muted)] text-base pointer-events-none">
            <LockIcon />
          </span>

          <input
            ref={ref}
            id={id}
            type={visible ? 'text' : 'password'}
            className={`w-full py-[13px] pl-[44px] pr-12 border-[1.5px] rounded-[var(--radius-md)] bg-[var(--color-surface)] font-body text-sm text-[var(--color-text)] outline-none transition-[border-color,box-shadow,background] duration-[var(--transition-fast)]
              placeholder:text-[var(--color-text-muted)]
              focus:border-[var(--color-secondary)] focus:shadow-[var(--shadow-input-focus)] focus:bg-[var(--color-background)]
              ${error ? 'border-[var(--color-error)]' : ''}`}
            {...rest}
          />

          <button
            type="button"
            className="absolute right-4 bg-none border-none cursor-pointer text-[var(--color-text-muted)] flex items-center justify-center p-1 rounded-[var(--radius-sm)] transition-colors duration-[var(--transition-fast)] hover:text-[var(--color-secondary)]"
            onClick={() => setVisible(v => !v)}
            aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        {showStrength && rest.value && (
          <div className="mt-2">
            <div className="h-1 bg-[var(--color-border)] rounded-[var(--radius-full)] overflow-hidden">
              <div className={`h-full rounded-[var(--radius-full)] transition-[width,background] duration-[var(--transition-base)] ${strength.cls}`}
                style={{
                  width: strength.score === 0 ? '0%' : strength.score === 1 ? '25%' : strength.score === 2 ? '50%' : strength.score === 3 ? '75%' : '100%',
                  background: strength.score <= 1 ? 'var(--color-error)' : strength.score === 2 ? 'var(--color-warning)' : strength.score === 3 ? '#81C784' : 'var(--color-success)'
                }} />
            </div>
            <span className="text-[var(--text-xs)] mt-1 text-[var(--color-text-muted)]">{strength.label}</span>
          </div>
        )}

        {error && (
          <span className="text-[var(--text-xs)] text-[var(--color-error)] flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </span>
        )}
      </div>
    );
  }
);

PasswordField.displayName = 'PasswordField';
export default PasswordField;
