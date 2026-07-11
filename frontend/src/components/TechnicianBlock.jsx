import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { StarRating } from '../utils/stars.jsx';

const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
export default function TechnicianBlock({ technicien, index }) {
  const { t } = useTranslation();

  const photo = technicien.photo_profil
    ? `/uploads/${technicien.photo_profil}`
    : null;

  const initials = technicien.prenom?.[0]?.toUpperCase() + technicien.nom?.[0]?.toUpperCase() || '?';
  const score = technicien.score != null ? Number(technicien.score).toFixed(1) : null;

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden transition-all duration-[var(--transition-base)] hover:shadow-[var(--shadow-md)] hover:-translate-y-[3px] flex flex-col">
      <Link to={`/technicien/${technicien.id}`} className="no-underline text-inherit">
        <div className="h-40 w-full bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 flex items-center justify-center overflow-hidden">
          {photo ? (
            <img src={photo} alt={`${technicien.prenom} ${technicien.nom}`} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-[var(--color-secondary)]">{initials}</span>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-base font-semibold text-[var(--color-text)] m-0 mb-1">
            {technicien.prenom} {technicien.nom}
          </h3>

          {technicien.specialite && (
            <span className="px-2 py-0.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs rounded-full self-start mb-2">
              {technicien.specialite}
            </span>
          )}

          <div className="flex items-center justify-between mt-auto pt-2">
            {score && (
              <StarRating score={technicien.score} size={14} />
            )}
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <Link
          to={`/technicien/${technicien.id}`}
          className="w-full py-[10px] bg-[var(--color-secondary)] text-white border-none rounded-[var(--radius-sm)] font-body text-sm font-semibold cursor-pointer inline-flex items-center justify-center gap-2 no-underline hover:bg-[var(--color-secondary-hover)] transition-colors duration-[var(--transition-base)]"
        >
          {t('home.view_profile')} <IconArrowRight />
        </Link>
      </div>
    </div>
  );
}
