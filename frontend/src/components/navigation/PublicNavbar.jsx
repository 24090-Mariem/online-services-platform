import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import LanguageSelector from '../ui/LanguageSelector';

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
const IconBrand = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

export default function PublicNavbar() {
  const { isAuthenticated, currentMode, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-[64px] bg-[var(--color-background)] border-b border-[var(--color-border)] flex items-center px-5 z-[100] gap-4">
      <Link to="/" className="flex items-center gap-[10px] no-underline">
        <div className="w-[38px] h-[38px] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0">
          <IconBrand />
        </div>
        <span className="text-[var(--text-md)] font-bold text-[var(--color-primary)] max-sm:hidden">CodevaServices</span>
      </Link>

      <div className="flex-1" />

      <LanguageSelector />

      <button className="w-[38px] h-[38px] rounded-[var(--radius-md)] border-none bg-transparent text-[var(--color-text-muted)] flex items-center justify-center cursor-pointer transition-[background,color] duration-[var(--transition-base)] hover:bg-[var(--color-surface)] hover:text-[var(--color-secondary)]" onClick={toggleTheme} title={theme === 'dark' ? t('nav.theme_light') : t('nav.theme_dark')}>
        {theme === 'dark' ? <IconSun /> : <IconMoon />}
      </button>

      {isAuthenticated ? (
        <div className="flex items-center gap-3">
          <Link to={currentMode === 'technicien' ? '/technicien/dashboard' : '/dashboard'}
            className="py-[8px] px-4 bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] text-sm font-semibold no-underline hover:bg-[var(--color-secondary)] transition-colors duration-[var(--transition-base)]">
            {t('public_nav.dashboard')}
          </Link>
          <button onClick={handleLogout}
            className="py-[8px] px-4 bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)] rounded-[var(--radius-md)] text-sm font-semibold cursor-pointer hover:bg-[var(--color-primary)] hover:text-white transition-colors duration-[var(--transition-base)]">
            {t('public_nav.logout')}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link to="/login"
            className="py-[8px] px-4 bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)] rounded-[var(--radius-md)] text-sm font-semibold no-underline hover:bg-[var(--color-primary)] hover:text-white transition-colors duration-[var(--transition-base)]">
            {t('public_nav.login')}
          </Link>
          <Link to="/register"
            className="py-[8px] px-4 bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] text-sm font-semibold no-underline hover:bg-[var(--color-secondary)] transition-colors duration-[var(--transition-base)]">
            {t('public_nav.register')}
          </Link>
        </div>
      )}
    </nav>
  );
}
