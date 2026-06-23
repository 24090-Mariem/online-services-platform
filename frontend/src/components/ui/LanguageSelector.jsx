import { useTranslation } from 'react-i18next';

const LANG_LIST = [
  { code: 'ar', label: 'AR', dir: 'rtl' },
  { code: 'fr', label: 'FR', dir: 'ltr' },
  { code: 'en', label: 'EN', dir: 'ltr' },
];

function getLang(code) {
  return LANG_LIST.find(l => code?.startsWith(l.code)) || LANG_LIST[0];
}

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const current = getLang(i18n.language);
  const nextIdx = (LANG_LIST.findIndex(l => l.code === current.code) + 1) % LANG_LIST.length;
  const next = LANG_LIST[nextIdx];

  const toggleLanguage = () => {
    i18n.changeLanguage(next.code);
    document.documentElement.dir = next.dir;
  };

  return (
    <button
      onClick={toggleLanguage}
      className="w-[38px] h-[38px] rounded-[var(--radius-md)] border-none bg-transparent text-[var(--color-text-muted)] flex items-center justify-center cursor-pointer transition-[background,color] duration-[var(--transition-base)] hover:bg-[var(--color-surface)] hover:text-[var(--color-secondary)] text-sm font-semibold"
      title={next.label}
    >
      {current.label}
    </button>
  );
}
