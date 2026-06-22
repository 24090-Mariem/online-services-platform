import { useState } from "react";
import { Link } from "react-router-dom";

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IconHelp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconMoon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const IconSun = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6"  x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IconBrand = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

const getInitials = (name = "") =>
  name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

export default function Navbar({ user = {}, onMenuToggle, userRoles = [] }) {
  const [searchValue, setSearchValue] = useState("");
  const badgeCount = 0;

  return (
    <nav className="fixed top-0 left-0 right-0 h-[64px] bg-[var(--color-background)] border-b border-[var(--color-border)] flex items-center px-0 pr-5 z-[100] gap-4
      max-md:pr-0 max-md:gap-2 max-sm:px-0 max-sm:pr-3 max-sm:gap-2">
      <div className="flex items-center gap-[10px] px-[14px] h-full">
        <button
          className="w-[38px] h-[38px] rounded-[var(--radius-md)] border-none bg-transparent text-[var(--color-text-secondary)] flex items-center justify-center cursor-pointer transition-[background,color] duration-[var(--transition-base)] hover:bg-[var(--color-surface)] hover:text-[var(--color-secondary)]"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
          id="navbar-hamburger"
        >
          <IconMenu />
        </button>

        <div className="w-[38px] h-[38px] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0">
          <IconBrand />
        </div>
        <div className="leading-[1.2] max-md:hidden">
          <span className="text-[var(--text-md)] font-bold text-[var(--color-primary)] block">CodevaServices</span>
        </div>
      </div>

      <div className="flex-1 max-w-[420px] relative max-lg:max-w-[280px] max-md:max-w-[240px] max-sm:max-w-[160px]">
        <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] flex pointer-events-none">
          <IconSearch />
        </span>
        <input
          type="text"
          className="w-full py-[10px] pl-10 pr-4 bg-[var(--color-surface)] border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-full)] text-[var(--text-md)] font-body text-[var(--color-text)] outline-none
            placeholder:text-[var(--color-text-secondary)]
            focus:border-[var(--color-secondary)] focus:shadow-[var(--shadow-input-focus)] focus:bg-[var(--color-background)]
            transition-[border-color,box-shadow,background] duration-[var(--transition-base)]"
          placeholder="Rechercher..."
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
        />
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <button className="w-[38px] h-[38px] rounded-[var(--radius-md)] border-none bg-transparent text-[var(--color-text-muted)] flex items-center justify-center cursor-pointer transition-[background,color] duration-[var(--transition-base)] hover:bg-[var(--color-surface)] hover:text-[var(--color-secondary)]" title="Aide">
          <IconHelp />
        </button>
        <Link
          to="/notifications"
          className="relative w-[38px] h-[38px] rounded-[var(--radius-md)] border-none bg-transparent text-[var(--color-text-muted)] flex items-center justify-center no-underline transition-[background,color] duration-[var(--transition-base)] hover:bg-[var(--color-surface)] hover:text-[var(--color-secondary)]"
          title="Notifications"
        >
          <IconBell />
          {badgeCount > 0 && (
            <span className="absolute top-1 right-1 w-[17px] h-[17px] bg-[var(--color-error)] rounded-full text-[var(--text-xs)] font-extrabold text-white flex items-center justify-center border-2 border-white">
              {badgeCount > 99 ? "99+" : badgeCount}
            </span>
          )}
        </Link>
      </div>

      <div className="w-px h-8 bg-[var(--color-border)] mx-2 max-md:hidden" />

      <div className="flex items-center gap-[10px] py-[6px] px-[10px] rounded-[var(--radius-md)] transition-[background] duration-[var(--transition-base)]">
        <div className="text-right leading-[1.25] max-md:hidden">
          <span className="text-[var(--text-md)] font-bold text-[var(--color-text)] block">{user.name || 'Utilisateur'}</span>
          <span className="text-[var(--text-xs)] text-[var(--color-text-muted)] font-medium">{user.role || 'admin'}</span>
        </div>
        {user.photo_profil ? (
          <img src={`/uploads/${user.photo_profil}`} alt={user.name} className="w-[38px] h-[38px] rounded-full object-cover border-2 border-[var(--color-primary)]/20" />
        ) : (
          <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-[var(--text-md)] font-extrabold text-white flex-shrink-0 border-2 border-[var(--color-primary)]/20">
            {getInitials(user.name)}
          </div>
        )}
      </div>
    </nav>
  );
}
