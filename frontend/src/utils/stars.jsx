function getStars(score) {
  const s = Number(score) || 0;
  if (s >= 800) return 5;
  if (s >= 600) return 4;
  if (s >= 400) return 3;
  if (s >= 200) return 2;
  return 1;
}

export function StarRating({ score, size = 16, showScore = true }) {
  const stars = getStars(score);
  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= stars ? 'var(--color-secondary)' : 'none'}
          stroke="var(--color-secondary)" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      {showScore && score != null && (
        <span className="ml-1 text-sm font-semibold text-[var(--color-secondary)]">
          {Number(score).toFixed(1)}
        </span>
      )}
    </span>
  );
}
