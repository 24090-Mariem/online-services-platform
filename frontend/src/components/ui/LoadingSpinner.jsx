
const LoadingSpinner = ({ size = 'md', overlay = false }) => {
  const sizes = { sm: 16, md: 24, lg: 40 };
  const px = sizes[size] || 24;
  const borderW = size === 'sm' ? 2 : 3;

  const spinner = (
    <span
      className="inline-block rounded-full animate-[spin_0.7s_linear_infinite]"
      style={{
        width: px,
        height: px,
        border: `${borderW}px solid var(--color-border)`,
        borderTopColor: 'var(--color-primary)',
      }}
      role="status"
      aria-label="Chargement…"
    />
  );

  if (!overlay) return spinner;

  return (
    <div
      className="fixed inset-0 bg-[var(--color-background)]/75 flex items-center justify-center"
      style={{ zIndex: 'var(--z-modal)' }}
    >
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
