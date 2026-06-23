import { useTranslation } from 'react-i18next';

export default function ServiceBlock({ service, onBook }) {
  const { t } = useTranslation();

  return (
    <div
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden transition-all duration-[var(--transition-base)] hover:shadow-[var(--shadow-md)] hover:-translate-y-[3px] flex flex-col"
    >
      <div className="h-40 w-full">
        {service.image ? (
          <img
            src={`/uploads/${service.image}`}
            alt={service.titre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="h-full bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 flex items-center justify-center text-[var(--color-secondary)] font-display text-lg font-bold">
            {service.titre?.[0]?.toUpperCase() || 'S'}
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs rounded-full">
            {service.categorie_nom}
          </span>
        </div>

        <h3 className="text-base font-semibold text-[var(--color-text)] m-0 mb-1 line-clamp-1">
          {service.titre}
        </h3>

        <p className="text-sm text-[var(--color-text-muted)] m-0 mb-3 line-clamp-2 flex-1">
          {service.description || ''}
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-[var(--color-text-secondary)] truncate">
            {service.technicien_prenom} {service.technicien_nom}
          </span>

          {service.prix && (
            <span className="text-base sm:text-lg font-bold text-[var(--color-secondary)] whitespace-nowrap">
              {Number(service.prix).toLocaleString()} MRU
            </span>
          )}
        </div>

        <button
          onClick={() => onBook(service)}
          className="w-full py-[10px] bg-[var(--color-secondary)] text-white border-none rounded-[var(--radius-sm)] font-body text-sm font-semibold cursor-pointer hover:bg-[var(--color-secondary-hover)] transition-colors"
        >
          {t('home.book')}
        </button>
      </div>
    </div>
  );
}
