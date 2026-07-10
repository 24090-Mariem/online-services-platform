import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

const IconBrand = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

const IconArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);
const IconStar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const IconPhone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IconMapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

function LoadingSkeletonNav() {
  return (
    <div className="fixed top-0 left-0 right-0 h-[64px] bg-[var(--color-background)] border-b border-[var(--color-border)] flex items-center px-5 z-[100] gap-4">
      <div className="w-[38px] h-[38px] rounded-[var(--radius-md)] bg-[var(--color-border)] animate-pulse" />
      <div className="flex-1" />
      <div className="w-24 h-4 bg-[var(--color-border)] rounded animate-pulse" />
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-[var(--color-background)]">
    <LoadingSkeletonNav />
    <div className="p-6 max-w-5xl mx-auto" style={{ paddingTop: 'calc(64px + 1.5rem)' }}>
      <div className="animate-pulse space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-[var(--color-border)]" />
          <div className="space-y-3 flex-1">
            <div className="h-6 w-48 bg-[var(--color-border)] rounded" />
            <div className="h-4 w-32 bg-[var(--color-border)] rounded" />
          </div>
        </div>
        <div className="h-64 bg-[var(--color-border)] rounded-[var(--radius-lg)]" />
      </div>
    </div>
  </div>
);

export default function PublicTechnicienProfile() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get(`/techniciens/public/${id}`)
      .then(r => {
        setData(r.data?.data ?? r.data);
      })
      .catch(() => setError('Technicien introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSkeleton />;

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <nav className="fixed top-0 left-0 right-0 h-[64px] bg-[var(--color-background)] border-b border-[var(--color-border)] flex items-center px-5 z-[100] gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-[10px] no-underline bg-none border-none cursor-pointer">
            <div className="w-[38px] h-[38px] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0">
              <IconBrand />
            </div>
            <span className="text-[var(--text-md)] font-bold text-[var(--color-primary)] max-sm:hidden">CodevaServices</span>
          </button>
          <div className="flex-1" />
        </nav>
        <div className="flex flex-col items-center justify-center gap-4 p-6" style={{ paddingTop: 'calc(64px + 2rem)' }}>
          <p className="text-[var(--color-text-muted)]">{error || t('technicien_profile.not_found')}</p>
          <Link to="/" className="py-[10px] px-6 bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] no-underline text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-colors">
            {t('technicien_profile.back_to_home')}
          </Link>
        </div>
      </div>
    );
  }

  const { technicien, galerie, avis } = data;
  const photo = technicien.photo_profil
    ? `/uploads/${technicien.photo_profil}`
    : null;
  const initials = technicien.prenom?.[0]?.toUpperCase() + technicien.nom?.[0]?.toUpperCase() || '?';
  const score = technicien.score != null ? Number(technicien.score).toFixed(1) : null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <nav className="fixed top-0 left-0 right-0 h-[64px] bg-[var(--color-background)] border-b border-[var(--color-border)] flex items-center px-5 z-[100] gap-4">
        <button onClick={() => navigate('/')} className="flex items-center gap-[10px] no-underline bg-none border-none cursor-pointer">
          <div className="w-[38px] h-[38px] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0">
            <IconBrand />
          </div>
          <span className="text-[var(--text-md)] font-bold text-[var(--color-primary)] max-sm:hidden">CodevaServices</span>
        </button>
        <div className="flex-1" />
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] no-underline hover:text-[var(--color-secondary)] transition-colors">
          <IconArrowLeft /> {t('technicien_profile.back_to_home')}
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6" style={{ paddingTop: 'calc(64px + 1.5rem)' }}>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {photo ? (
                <img src={photo} alt={`${technicien.prenom} ${technicien.nom}`} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-[var(--color-secondary)]">{initials}</span>
              )}
            </div>

            <div className="flex-1 text-center sm:text-start">
              <h1 className="font-display text-[var(--text-xl)] font-bold text-[var(--color-text)] m-0">
                {technicien.prenom} {technicien.nom}
              </h1>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                {technicien.specialite && (
                  <span className="px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm rounded-full">
                    {technicien.specialite}
                  </span>
                )}
                {score && (
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-secondary)]">
                    <IconStar /> {score}/10
                  </span>
                )}
                {technicien.badge && (
                  <span className="px-3 py-1 bg-[var(--color-warning-bg)] text-[var(--color-warning)] text-sm rounded-full">
                    {technicien.badge}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-sm text-[var(--color-text-muted)]">
                {technicien.email && (
                  <span className="inline-flex items-center gap-1.5"><IconMail /> {technicien.email}</span>
                )}
                {technicien.telephone && (
                  <span className="inline-flex items-center gap-1.5"><IconPhone /> {technicien.telephone}</span>
                )}
                {technicien.adresse && (
                  <span className="inline-flex items-center gap-1.5"><IconMapPin /> {technicien.adresse}</span>
                )}
                {technicien.created_at && (
                  <span className="inline-flex items-center gap-1.5"><IconCalendar /> {t('technicien_profile.member_since')} {formatDate(technicien.created_at)}</span>
                )}
              </div>
            </div>

            {avis && avis.length > 0 && (
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <span className="text-3xl font-bold text-[var(--color-secondary)]">
                  {score}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {avis.length} {t('technicien_profile.avis_label')}
                </span>
              </div>
            )}
          </div>
        </div>

        <section className="mb-8">
          <h2 className="font-display text-[var(--text-lg)] font-bold text-[var(--color-text)] m-0 mb-4">
            {t('technicien_profile.avis_label')}
          </h2>

          {avis && avis.length > 0 ? (
            <div className="space-y-3">
              {avis.map(a => (
                <div key={a.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="inline-flex items-center gap-1.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={`text-sm ${i < Math.round(a.note / 2) ? 'text-[var(--color-secondary)]' : 'text-[var(--color-border)]'}`}>★</span>
                      ))}
                      <span className="ml-2 text-sm font-bold text-[var(--color-secondary)]">{a.note}/10</span>
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)]">{formatDate(a.date_avis)}</span>
                  </div>
                  {a.commentaire && (
                    <p className="text-sm text-[var(--color-text-secondary)] m-0">{a.commentaire}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">{t('technicien_profile.no_avis')}</p>
          )}
        </section>

        <section>
          <h2 className="font-display text-[var(--text-lg)] font-bold text-[var(--color-text)] m-0 mb-4">
            {t('technicien_profile.gallery_title')}
          </h2>

          {galerie && galerie.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {galerie.map(g => (
                <div key={g.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden group">
                  {g.image && (
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={`/uploads/${g.image}`}
                        alt={g.description || ''}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[var(--transition-base)]"
                      />
                    </div>
                  )}
                  <div className="p-3">
                    {g.description && (
                      <p className="text-xs text-[var(--color-text-secondary)] m-0 mb-1 line-clamp-2">{g.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                      {g.avis_note != null && (
                        <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-secondary)]">
                          <IconStar /> {g.avis_note}/10
                        </span>
                      )}
                      {g.date_service && (
                        <span>{t('technicien_profile.completed_on')} {formatDate(g.date_service)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">{t('technicien_profile.no_gallery')}</p>
          )}
        </section>
      </div>
    </div>
  );
}
