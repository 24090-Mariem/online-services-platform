import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import ServiceBlock from '../../components/ServiceBlock';
import ReservationModal from '../../components/ReservationModal';


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
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

export default function AllServices() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    api.get('/services').then(r => {
      const p = r.data?.data ?? [];
      setServices(Array.isArray(p) ? p : (Array.isArray(p?.data) ? p.data : []));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = services.filter(s =>
    !search || `${s.titre || ''} ${s.description || ''} ${s.categorie_nom || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-body text-[var(--color-text)]">
      <nav className="fixed top-0 left-0 right-0 h-[64px] bg-[var(--color-background)] border-b border-[var(--color-border)] flex items-center px-5 z-[100] gap-4">
        <button onClick={() => navigate('/')} className="flex items-center gap-[10px] no-underline bg-none border-none cursor-pointer">
          <div className="w-[38px] h-[38px] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0">
            <IconBrand />
          </div>
          <span className="text-[var(--text-md)] font-bold text-[var(--color-primary)] max-sm:hidden">CodevaServices</span>
        </button>
        <div className="flex-1" />
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] no-underline hover:text-[var(--color-secondary)] transition-colors">
          <IconArrowLeft /> {t('nav.back_home')}
        </Link>
      </nav>

      <div className="pt-[80px] pb-10 px-5">
        <div className="max-w-[1200px] mx-auto">
          <div className="relative max-w-md mb-8">
            <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] flex pointer-events-none">
              <IconSearch />
            </span>
            <input
              className="w-full py-[14px] pl-[42px] pr-4 bg-[var(--color-surface)] border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-sm)] font-body text-base text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
              type="text" placeholder={t('home.search_service_placeholder')} value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {filtered.map(s => (
                <ServiceBlock
                  key={s.id}
                  service={s}
                  onBook={(svc) => {
                        if (!user) { navigate('/login'); return; }
                        setSelectedService(svc);
                  }}
                />
              ))}
              {filtered.length === 0 && (
                <p className="col-span-full text-center text-[var(--color-text-muted)] py-16">{t('home.no_results')}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedService && (
        <ReservationModal service={selectedService} onClose={() => setSelectedService(null)} />
      )}
    </div>
  );
}
