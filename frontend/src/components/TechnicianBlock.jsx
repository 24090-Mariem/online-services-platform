import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TECH_EMOJIS = ['\u{1F468}\u{200D}\u{1F527}', '\u{1F469}\u{200D}\u{1F527}', '\u{1F468}\u{200D}\u{1F527}', '\u{1F469}\u{200D}\u{1F3A8}', '\u{1F468}\u{200D}\u{1F4BB}', '\u{1F477}', '\u{1F9F9}', '\u{1F6E1}'];

function scoreToStars(score) {
  if (score == null) return 0;
  return Math.min(Math.max((score / 100) * 5, 0), 5);
}

function renderRatingStars(score, reviews) {
  const stars = scoreToStars(score);
  return (
    <div className="flex items-center justify-center gap-0.5 mb-4">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= Math.round(stars) ? 'var(--color-warning)' : 'none'} stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="text-sm font-semibold text-[var(--color-text)] ml-1">{stars.toFixed(1)}</span>
      <span className="text-xs text-[var(--color-text-muted)] ml-0.5">({reviews})</span>
    </div>
  );
}

const getEmoji = (i) => TECH_EMOJIS[i % TECH_EMOJIS.length];

export default function TechnicianBlock({ technicien, index = 0 }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tech = technicien;

  return (
    <div
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-center transition-all duration-[var(--transition-base)] hover:border-[var(--color-secondary)] hover:shadow-[var(--shadow-md)] hover:-translate-y-[3px] overflow-hidden"
    >
      {tech.photo_profil ? (
        <img src={`/uploads/${tech.photo_profil}`} alt={tech.prenom} className="w-full h-40 sm:h-48 object-cover" />
      ) : (
        <div className="pt-6 sm:pt-8 pb-2">
          <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-surface)] flex items-center justify-center text-[32px] mx-auto mb-4 border-2 border-[var(--color-primary)]">
            {getEmoji(index)}
          </div>
        </div>
      )}

      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <h3 className="text-base font-semibold text-[var(--color-text)] m-0 mb-1 truncate">
          {tech.prenom} {tech.nom}
        </h3>
        <p className="text-sm text-[var(--color-secondary)] font-medium m-0 mb-3 truncate">
          {tech.specialite}
        </p>
        {renderRatingStars(tech.score, tech.avis_count || 0)}
        <button
          onClick={() => navigate(`/technicien/${tech.id}`)}
          className="w-full py-[10px] h-[42px] bg-[var(--color-secondary)] text-white border-none rounded-[var(--radius-sm)] font-body text-sm font-semibold cursor-pointer hover:bg-[var(--color-secondary-hover)] hover:shadow-[var(--shadow-md)] transition-[background,box-shadow] duration-[var(--transition-base)]"
        >
          {t('home.view_profile')}
        </button>
      </div>
    </div>
  );
}
