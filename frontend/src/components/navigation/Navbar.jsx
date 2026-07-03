import { useState, memo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import LanguageSelector from '../ui/LanguageSelector';
import { IconSearch, IconHelp, IconBell, IconMenu, IconBrand, IconMoon, IconSun } from '../ui/Icons';
import { getUploadUrl } from '../../utils/uploads';

const getInitials = (name = "") =>
  name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

const Navbar = memo(function Navbar({ user = {}, onMenuToggle }) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const [searchValue, setSearchValue] = useState("");

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
          placeholder={t('nav.search_placeholder')}
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
        />
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <LanguageSelector />
        <button className="w-[38px] h-[38px] rounded-[var(--radius-md)] border-none bg-transparent text-[var(--color-text-muted)] flex items-center justify-center cursor-pointer transition-[background,color] duration-[var(--transition-base)] hover:bg-[var(--color-surface)] hover:text-[var(--color-secondary)]" onClick={toggleTheme} title={theme === 'dark' ? t('nav.theme_light') : t('nav.theme_dark')}>
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
        </button>
        <button className="w-[38px] h-[38px] rounded-[var(--radius-md)] border-none bg-transparent text-[var(--color-text-muted)] flex items-center justify-center cursor-pointer transition-[background,color] duration-[var(--transition-base)] hover:bg-[var(--color-surface)] hover:text-[var(--color-secondary)]" title={t('nav.help')}>
          <IconHelp />
        </button>
        <Link
          to="/notifications"
          className="relative w-[38px] h-[38px] rounded-[var(--radius-md)] border-none bg-transparent text-[var(--color-text-muted)] flex items-center justify-center no-underline transition-[background,color] duration-[var(--transition-base)] hover:bg-[var(--color-surface)] hover:text-[var(--color-secondary)]"
          title={t('notifications.title')}
        >
          <IconBell />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-[17px] h-[17px] bg-[var(--color-error)] rounded-full text-[var(--text-xs)] font-extrabold text-white flex items-center justify-center border-2 border-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>
      </div>

      <div className="w-px h-8 bg-[var(--color-border)] mx-2 max-md:hidden" />

      <div className="flex items-center gap-[10px] py-[6px] px-[10px] rounded-[var(--radius-md)] transition-[background] duration-[var(--transition-base)]">
        <div className="text-right leading-[1.25] max-md:hidden">
          <span className="text-[var(--text-md)] font-bold text-[var(--color-text)] block">{user.name || t('nav.default_user')}</span>
          <span className="text-[var(--text-xs)] text-[var(--color-text-muted)] font-medium">{user.role || t('nav.default_role')}</span>
        </div>
        {user.photo_profil ? (
          <img src={getUploadUrl(user.photo_profil)} alt={user.name} className="w-[38px] h-[38px] rounded-full object-cover border-2 border-[var(--color-primary)]/20" />
        ) : (
          <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-[var(--text-md)] font-extrabold text-white flex-shrink-0 border-2 border-[var(--color-primary)]/20">
            {getInitials(user.name)}
          </div>
        )}
      </div>
    </nav>
  );
});

export default Navbar;
