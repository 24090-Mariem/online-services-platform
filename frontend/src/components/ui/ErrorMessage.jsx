import { ErrorIcon } from './Icons';

export default function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div className="p-3 mb-6 rounded-[var(--radius-sm)] text-sm flex items-center gap-2"
      style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}>
      {ErrorIcon}
      {message}
    </div>
  );
}
