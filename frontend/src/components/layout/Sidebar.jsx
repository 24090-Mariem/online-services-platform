import { useState } from "react";
import { SIDEBAR_CONFIG } from "./sidebarConfig";

const ICONS = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  technician: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  services: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
    </svg>
  ),
  categories: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  reviews: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  reports: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  bell: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  stats: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14"/>
      <path d="M12 2v2m0 18v-2M2 12h2m18 0h-2"/>
    </svg>
  ),
  profile: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  system: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  calendar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  history: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="12 8 12 12 14 14"/>
      <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"/>
    </svg>
  ),
  messages: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  tracking: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8v4l3 3"/>
    </svg>
  ),
  invoice: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  chevron: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
};

const LABELS = {
  "sidebar.dashboard": "Tableau de bord",
  "sidebar.section_users": "Utilisateurs",
  "sidebar.administrators": "Administrateurs",
  "sidebar.requests": "Demandes",
  "sidebar.technicians": "Techniciens",
  "sidebar.section_management": "Gestion",
  "sidebar.services": "Services",
  "sidebar.categories": "Catégories",
  "sidebar.reviews": "Avis",
  "sidebar.reports": "Signalements",
  "sidebar.notifications": "Notifications",
  "sidebar.statistics": "Statistiques",
  "sidebar.section_my_space": "Mon espace",
  "sidebar.admin_profile": "Profil",
  "sidebar.app_settings": "Paramètres app",
  "sidebar.logout": "Déconnexion",
  "sidebar.my_services": "Mes services",
  "sidebar.reservations": "Réservations",
  "sidebar.my_schedule": "Mon planning",
  "sidebar.my_profile": "Mon profil",
  "sidebar.settings": "Paramètres",
  "sidebar.welcome": "Accueil",
  "sidebar.my_reservations": "Mes réservations",
  "sidebar.my_reviews": "Mes avis",
};

function t(key) {
  return LABELS[key] || key;
}

function SidebarItem({ item, activePage, onNavigate }) {
  const hasChildren = item.children && item.children.length > 0;
  const isChildActive = hasChildren && item.children.some(c => c.key === activePage);
  const isActive = activePage === item.key || isChildActive;
  const [open, setOpen] = useState(isChildActive);

  const handleClick = () => {
    if (hasChildren) {
      setOpen(prev => !prev);
    } else {
      onNavigate(item.path);
    }
  };

  return (
    <>
      {item.divider && <div className="h-px bg-[var(--color-border)] my-3 mx-4" />}

      <button
        className={`flex items-center gap-[11px] py-[10px] px-4 mx-2 rounded-[var(--radius-md)] border-none bg-transparent text-[var(--color-text-muted)] text-[var(--text-md)] font-semibold font-body cursor-pointer transition-all duration-[var(--transition-base)] text-left w-[calc(100%-16px)] relative
          hover:bg-[var(--color-surface)] hover:text-[var(--color-secondary)]
          ${isActive && !hasChildren ? '!bg-[var(--color-primary)]/10 !text-[var(--color-primary)] font-bold' : ''}
          ${item.danger ? '!text-[var(--color-error)]' : ''}
          ${item.danger ? 'hover:!bg-[var(--color-error-bg)] hover:!text-[var(--color-error)]' : ''}`}
        onClick={handleClick}
        title={t(item.label)}
      >
        {isActive && !hasChildren && (
          <span className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-1 h-3/5 bg-[var(--color-primary)] rounded-r-[var(--radius-sm)]" />
        )}

        <span className="flex items-center justify-center w-5 flex-shrink-0">
          {ICONS[item.icon] || ICONS.dashboard}
        </span>

        <span className="flex-1">{t(item.label)}</span>

        {item.badge > 0 && (
          <span className="ml-auto bg-[var(--color-error)] text-white text-[var(--text-xs)] font-extrabold py-0.5 px-[7px] rounded-full min-w-5 text-center">
            {item.badge}
          </span>
        )}

        {item.status === "online" && (
          <span className="w-2 h-2 rounded-full bg-[var(--color-success)] ml-auto shadow-[0_0_0_2px_rgba(16,185,129,0.25)]" />
        )}

        {hasChildren && (
          <span className={`ml-auto transition-transform duration-[var(--transition-base)] text-[var(--color-text-secondary)] ${open ? 'rotate-180' : ''}`}>
            {ICONS.chevron}
          </span>
        )}
      </button>

      {hasChildren && (
        <div
          className="overflow-hidden transition-[max-height] duration-[var(--transition-base)]"
          style={{ maxHeight: open ? `${item.children.length * 44}px` : "0" }}
        >
          {item.children.map(child => (
            <button
              key={child.key}
              className={`flex items-center gap-2 py-2 px-4 pl-11 mx-2 rounded-[var(--radius-md)] border-none bg-transparent text-[var(--color-text-muted)] text-sm font-semibold font-body cursor-pointer transition-all duration-[var(--transition-base)] text-left w-[calc(100%-16px)]
                hover:bg-[var(--color-surface)] hover:text-[var(--color-secondary)]
                ${activePage === child.key ? 'text-[var(--color-secondary)] font-bold' : ''}`}
              onClick={() => onNavigate(child.path || child.key)}
            >
              <span className="w-[6px] h-[6px] rounded-full flex-shrink-0"
                style={{ background: activePage === child.key ? 'var(--color-secondary)' : 'var(--color-border)' }} />
              {t(child.label)}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export default function Sidebar({ role = "admin", activePage = "dashboard", onNavigate, isOpen = false }) {
  const config = SIDEBAR_CONFIG[role] || SIDEBAR_CONFIG.admin;

  const resolveItem = (item) => {
    if (item.badge === true) {
      return { ...item, badge: 0 };
    }
    return item;
  };

  const renderItems = (items) =>
    items.map((item) => (
      <SidebarItem key={item.key} item={resolveItem(item)} activePage={activePage} onNavigate={onNavigate} />
    ));

  return (
    <aside className="fixed top-[64px] w-[248px] h-[calc(100vh-64px)] bg-[var(--color-background)] border-r border-[var(--color-border)] flex flex-col z-[90] overflow-y-auto pb-4 shadow-[var(--shadow-sm)] transition-[left] duration-[var(--transition-slow)] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[var(--color-border)]"
      style={{ left: isOpen ? 0 : -258 }}
    >
      {config.sections.map((section, sIdx) => (
        <div key={sIdx}>
          {section.label && (
            <p className="text-[var(--text-xs)] font-extrabold tracking-[0.08em] uppercase text-[var(--color-text-secondary)] pt-[18px] pb-[6px] px-5">
              {t(section.label)}
            </p>
          )}
          {renderItems(section.items)}
        </div>
      ))}

      {config.bottom && (
        <div className="mt-auto">
          {renderItems(config.bottom)}
        </div>
      )}
    </aside>
  );
}
