import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import ReservationModal from '../components/ReservationModal';
import ServiceBlock from '../components/ServiceBlock';
import TechnicianBlock from '../components/TechnicianBlock';
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from '../hooks/useAuth';

const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IconMapPin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const IconCheckCircle = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconHeart = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const statsIcons = [IconCheckCircle, IconCalendar, IconHeart];

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchService, setSearchService] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [categories, setCategories] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [stats, setStats] = useState({ techniciens: 0, reservations: 0, reviews: 0 });

  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    nom: '', prenom: '', email: '', telephone: '', specialite: '',
    piece_identite: null, diplome: null, photo_profil: null,
  });
  const [, setPartnerFileNames] = useState({ piece_identite: '', diplome: '', photo_profil: '' });
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [partnerError, setPartnerError] = useState('');
  const [partnerSuccess, setPartnerSuccess] = useState('');

  const handlePartnerChange = e => {
    const { name, value, files } = e.target;
    if (files) {
      setPartnerForm(prev => ({ ...prev, [name]: files[0] || null }));
      setPartnerFileNames(prev => ({ ...prev, [name]: files[0]?.name || '' }));
    } else {
      setPartnerForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePartnerSubmit = async e => {
    e.preventDefault();
    setPartnerLoading(true);
    setPartnerError('');
    setPartnerSuccess('');
    try {
      const fd = new FormData();
      fd.append('nom', partnerForm.nom);
      fd.append('prenom', partnerForm.prenom);
      fd.append('email', partnerForm.email);
      fd.append('telephone', partnerForm.telephone || '');
      fd.append('specialite', partnerForm.specialite);
      if (partnerForm.piece_identite) fd.append('piece_identite', partnerForm.piece_identite);
      if (partnerForm.diplome) fd.append('diplome', partnerForm.diplome);
      if (partnerForm.photo_profil) fd.append('photo_profil', partnerForm.photo_profil);
      await api.post('/techniciens/demande', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPartnerSuccess(t('home.partner_success'));
      setShowPartnerForm(false);
    } catch (err) {
      setPartnerError(err.response?.data?.message || t('home.partner_error'));
    } finally {
      setPartnerLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([
      api.get('/categories').then(r => {
        console.log('Response:', r);
        const p = r.data?.data ?? [];
        console.log('Data:', p);
        const list = Array.isArray(p) ? p : (Array.isArray(p?.data) ? p.data : []);
        console.log('Is Array:', Array.isArray(list));
        return list;
      }).catch(() => []),
      api.get('/techniciens').then(r => {
        console.log('Response:', r);
        const p = r.data?.data ?? [];
        console.log('Data:', p);
        const list = Array.isArray(p) ? p : (Array.isArray(p?.data) ? p.data : []);
        console.log('Is Array:', Array.isArray(list));
        return list;
      }).catch(() => []),
      api.get('/services').then(r => {
        console.log('Response:', r);
        const p = r.data?.data ?? [];
        console.log('Data:', p);
        const list = Array.isArray(p) ? p : (Array.isArray(p?.data) ? p.data : []);
        console.log('Is Array:', Array.isArray(list));
        return list;
      }).catch(() => []),
      api.get('/stats/overview').then(r => r.data.data).catch(() => ({ techniciens: 0, reservations: 0, reviews: 0 })),
    ])
      .then(([cats, techs, svcs, sts]) => {
        setCategories(cats);
        setTechniciens(techs);
        setServices(svcs);
        setStats(sts);
      })
      .catch(() => toast.error('Erreur lors du chargement des données'));
  }, []);

  const filteredServices = services.filter(s =>
    !searchService || s.titre?.toLowerCase().includes(searchService.toLowerCase())
  );

  const filteredTechniciens = techniciens.filter(t =>
    !searchCity || t.ville?.toLowerCase().includes(searchCity.toLowerCase())
  );

  const statKeys = ['home.stats_techs', 'home.stats_bookings', 'home.stats_reviews'];

  return (
    <div className="font-body text-[var(--color-text)]">
      <section className="relative bg-cover bg-center rounded-[var(--radius-sm)] px-10 py-16 mb-10 overflow-hidden isolation-isolate
        before:absolute before:inset-0 before:bg-[var(--color-primary)] before:opacity-80 before:z-0 before:pointer-events-none
        max-lg:px-8 max-lg:py-10 max-md:px-6 max-md:py-8 max-sm:px-4 max-sm:py-6 max-sm:rounded-[var(--radius-lg)]"
        style={{ backgroundImage: "url('/uploads/i.jpeg')" }}>
        <div className="max-w-[640px] relative z-[1]">
          <h1 className="font-display text-[var(--text-2xl)] font-bold text-white m-0 mb-3 leading-[1.25]
            max-md:text-[var(--text-xl)] max-sm:text-[var(--text-lg)]">
            {t('home.hero_title')}
          </h1>
          <p className="text-[var(--text-md)] text-white/85 m-0 mb-8 leading-[1.6] max-sm:text-[var(--text-base)]">
            {t('home.hero_subtitle')}
          </p>
          <div className="flex gap-3 flex-wrap max-md:flex-col">
            <div className="flex-1 min-w-[180px] relative max-md:min-w-unset">
              <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] flex pointer-events-none">
                <IconSearch />
              </span>
              <input
                className="w-full py-[14px] pl-[42px] pr-4 bg-[var(--color-background)] border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-sm)] font-body text-base text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:shadow-[var(--shadow-input-focus)]"
                type="text" placeholder={t('home.search_service_placeholder')} value={searchService}
                onChange={e => setSearchService(e.target.value)} />
            </div>
            <div className="flex-1 min-w-[180px] relative max-md:min-w-unset">
              <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] flex pointer-events-none">
                <IconMapPin />
              </span>
              <input
                className="w-full py-[14px] pl-[42px] pr-4 bg-[var(--color-background)] border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-sm)] font-body text-base text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:shadow-[var(--shadow-input-focus)]"
                type="text" placeholder={t('home.search_city_placeholder')} value={searchCity}
                onChange={e => setSearchCity(e.target.value)} />
            </div>
            <button onClick={() => {
              const el = document.getElementById('services-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} className="py-[14px] px-8 bg-[var(--color-secondary)] text-white border-none rounded-[var(--radius-sm)] font-body text-base font-semibold cursor-pointer inline-flex items-center gap-2 whitespace-nowrap hover:bg-[var(--color-secondary-hover)] hover:shadow-[var(--shadow-md)] transition-[background,box-shadow] duration-[var(--transition-base)]">
              {t('home.search_button')} <IconArrowRight />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-6 items-center">
            <span className="text-sm text-white/75 mr-2">{t('home.popular_label')}</span>
            {categories.slice(0, 5).map(c => (
              <button className="py-[6px] px-4 bg-white/15 border border-white/30 rounded-full text-sm text-white cursor-pointer backdrop-blur-[4px] font-body hover:bg-white/30 hover:border-white transition-all duration-[var(--transition-base)]" key={c.id || c.nom}>
                {c.nom}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="services-section" className="mb-12">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="font-display text-[var(--text-xl)] font-bold text-[var(--color-text)] m-0">
              {t('home.section_available_services_title')}
            </h2>
            <p className="text-base text-[var(--color-text-secondary)] mt-2 m-0">
              {t('home.section_available_services_subtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {filteredServices.map(s => (
            <ServiceBlock
              key={s.id}
              service={s}
              onBook={(svc) => {
                if (!user) { navigate('/login'); return; }
                setSelectedService(svc);
              }}
            />
          ))}
        </div>
      </section>

      {selectedService && (
        <ReservationModal service={selectedService} onClose={() => setSelectedService(null)} />
      )}

      <section className="mb-12">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4 max-md:flex-col max-md:items-start">
          <div>
            <h2 className="font-display text-[var(--text-xl)] font-bold text-[var(--color-text)] m-0">{t('home.section_techs_title')}</h2>
            <p className="text-base text-[var(--color-text-secondary)] mt-2 m-0">{t('home.section_techs_subtitle')}</p>
          </div>
          <button onClick={() => navigate('/techniciens')} className="text-sm font-semibold text-[var(--color-secondary)] no-underline inline-flex items-center gap-1 cursor-pointer transition-colors duration-[var(--transition-base)] bg-none border-none font-body p-0 hover:text-[var(--color-secondary-hover)]">
            {t('home.view_all')} <IconArrowRight />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-md:grid-cols-2 max-sm:grid-cols-1">
          {filteredTechniciens.map((tech, i) => (
            <TechnicianBlock key={tech.id} technicien={tech} index={i} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-6 mb-12 max-md:grid-cols-1">
        {[stats.techniciens, stats.reservations, stats.reviews].map((val, i) => {
          const Icon = statsIcons[i];
          return (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] px-6 py-8 text-center transition-all duration-[var(--transition-base)] hover:shadow-[var(--shadow-md)] hover:-translate-y-[3px] max-sm:px-4 max-sm:py-6" key={statKeys[i]}>
              <div className="w-[72px] h-[72px] bg-[var(--color-surface)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon />
              </div>
              <h3 className="font-display text-[var(--text-2xl)] font-bold text-[var(--color-text)] m-0 mb-1">{val.toLocaleString()}</h3>
              <p className="text-base text-[var(--color-text-secondary)] m-0">{t(statKeys[i])}</p>
            </div>
          );
        })}
      </section>

      <section className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-[var(--radius-lg)] px-10 py-12 text-center mb-6 max-sm:px-6 max-sm:py-8 max-sm:rounded-[var(--radius-lg)]">
        <h2 className="font-display text-[var(--text-xl)] font-bold text-white m-0 mb-3 max-sm:text-[var(--text-lg)]">
          {t('home.cta_title')}
        </h2>
        <p className="text-[var(--text-md)] text-white/85 mx-auto mb-8 max-w-[520px] leading-[1.6]">
          {t('home.cta_subtitle')}
        </p>
        <button onClick={() => setShowPartnerForm(prev => !prev)} className="py-[14px] px-10 bg-white text-[var(--color-primary)] border-none rounded-[var(--radius-lg)] font-body text-base font-bold cursor-pointer inline-flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,0,0,0.2)] transition-[transform,box-shadow] duration-[var(--transition-base)]">
          {showPartnerForm ? t('home.cta_close') : t('home.cta_button')} <IconArrowRight />
        </button>
      </section>

      {showPartnerForm && (
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-8 mb-6 max-w-[640px] mx-auto">
          <h3 className="font-display text-[var(--text-lg)] font-bold text-[var(--color-text)] m-0 mb-1">{t('home.partner_title')}</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">{t('home.partner_subtitle')}</p>

          {partnerError && (
            <div className="px-4 py-3 bg-[var(--color-error-bg)] text-[var(--color-error)] rounded-[var(--radius-md)] text-sm mb-4">{partnerError}</div>
          )}
          {partnerSuccess && (
            <div className="px-4 py-3 bg-[var(--color-success-bg)] text-[var(--color-success)] rounded-[var(--radius-md)] text-sm mb-4">{partnerSuccess}</div>
          )}

          <form onSubmit={handlePartnerSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[var(--color-text)]" htmlFor="partner-nom">{t('home.partner_label_nom')}</label>
                <input id="partner-nom" name="nom" value={partnerForm.nom} onChange={handlePartnerChange} required
                  className="w-full py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] font-body text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-secondary)] focus:shadow-[var(--shadow-input-focus)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[var(--color-text)]" htmlFor="partner-prenom">{t('home.partner_label_prenom')}</label>
                <input id="partner-prenom" name="prenom" value={partnerForm.prenom} onChange={handlePartnerChange} required
                  className="w-full py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] font-body text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-secondary)] focus:shadow-[var(--shadow-input-focus)]" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[var(--color-text)]" htmlFor="partner-email">{t('home.partner_label_email')}</label>
              <input id="partner-email" name="email" type="email" value={partnerForm.email} onChange={handlePartnerChange} required
                className="w-full py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] font-body text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-secondary)] focus:shadow-[var(--shadow-input-focus)]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[var(--color-text)]" htmlFor="partner-telephone">{t('home.partner_label_telephone')}</label>
              <input id="partner-telephone" name="telephone" value={partnerForm.telephone} onChange={handlePartnerChange}
                className="w-full py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] font-body text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-secondary)] focus:shadow-[var(--shadow-input-focus)]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[var(--color-text)]" htmlFor="partner-specialite">{t('home.partner_label_specialite')}</label>
              <select id="partner-specialite" name="specialite" value={partnerForm.specialite} onChange={handlePartnerChange} required
                className="w-full py-[11px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] font-body text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-secondary)] focus:shadow-[var(--shadow-input-focus)] appearance-none cursor-pointer">
                <option value="">{t('home.partner_placeholder_specialite')}</option>
                {categories.map(c => (
                  <option key={c.id || c.nom} value={c.nom}>{c.nom}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[var(--color-text)]" htmlFor="partner-photo">{t('home.partner_label_photo')}</label>
              <input id="partner-photo" name="photo_profil" type="file" accept=".png,.jpg,.jpeg,.webp" onChange={handlePartnerChange}
                className="w-full py-[10px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] font-body text-sm text-[var(--color-text)] outline-none file:mr-3 file:py-1.5 file:px-3 file:rounded-[var(--radius-sm)] file:border-none file:bg-[var(--color-primary)] file:text-white file:text-xs file:font-semibold file:cursor-pointer focus:border-[var(--color-secondary)] focus:shadow-[var(--shadow-input-focus)]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[var(--color-text)]" htmlFor="partner-piece">{t('home.partner_label_piece')}</label>
              <input id="partner-piece" name="piece_identite" type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handlePartnerChange}
                className="w-full py-[10px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] font-body text-sm text-[var(--color-text)] outline-none file:mr-3 file:py-1.5 file:px-3 file:rounded-[var(--radius-sm)] file:border-none file:bg-[var(--color-primary)] file:text-white file:text-xs file:font-semibold file:cursor-pointer focus:border-[var(--color-secondary)] focus:shadow-[var(--shadow-input-focus)]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[var(--color-text)]" htmlFor="partner-diplome">{t('home.partner_label_diplome')}</label>
              <input id="partner-diplome" name="diplome" type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handlePartnerChange}
                className="w-full py-[10px] px-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-background)] font-body text-sm text-[var(--color-text)] outline-none file:mr-3 file:py-1.5 file:px-3 file:rounded-[var(--radius-sm)] file:border-none file:bg-[var(--color-primary)] file:text-white file:text-xs file:font-semibold file:cursor-pointer focus:border-[var(--color-secondary)] focus:shadow-[var(--shadow-input-focus)]" />
            </div>
            <button type="submit" disabled={partnerLoading}
              className="w-full py-[13px] bg-[var(--color-secondary)] text-white border-none rounded-[var(--radius-md)] font-body text-base font-semibold cursor-pointer transition-[background] duration-[var(--transition-fast)] hover:bg-[var(--color-secondary-hover)] disabled:opacity-50 disabled:cursor-not-allowed">
              {partnerLoading ? t('home.partner_submitting') : t('home.partner_submit')}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
