
import { useTranslation } from 'react-i18next';

const IllustrationPanel = ({ title, subtitle, illustration, features = [] }) => {
  const { t } = useTranslation();
  return (
    <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[var(--color-primary)]/8 via-[var(--color-primary)]/12 to-[var(--color-secondary)]/8 px-8 py-10
      before:absolute before:-top-[60px] before:-right-[60px] before:w-[200px] before:h-[200px] before:rounded-full before:bg-[radial-gradient(circle,rgba(17,75,95,0.12)_0%,transparent_70%)]
      after:absolute after:-bottom-[40px] after:-left-[40px] after:w-[160px] after:h-[160px] after:rounded-full after:bg-[radial-gradient(circle,rgba(26,147,111,0.08)_0%,transparent_70%)]">
      <div className="flex items-center gap-3 z-[1]">
        <div className="w-[36px] h-[36px] bg-[var(--color-primary)] rounded-[var(--radius-md)] flex items-center justify-center text-white font-display font-bold text-[var(--text-md)] shadow-[var(--shadow-md)]">
          S
        </div>
        <span className="font-display font-bold text-[var(--text-md)] text-[var(--color-secondary)]">
          {t('auth.illustration_badge')}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 z-[1] py-6">
        <h1 className="font-display text-[var(--text-xl)] font-bold text-[var(--color-secondary)] text-left self-start">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-[var(--color-text-secondary)] text-left self-start leading-[1.6] -mt-4 whitespace-pre-line">
            {subtitle}
          </p>
        )}
        <div className="w-full max-w-[280px] h-auto animate-[float_4s_ease-in-out_infinite]">
          {illustration}
        </div>
      </div>

      {features.length > 0 && (
        <div className="flex gap-4 z-[1]">
          {features.map((f, i) => (
            <div className="flex flex-col items-center gap-2 flex-1" key={i}>
              <div className="w-[36px] h-[36px] bg-[var(--color-primary)]/15 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-primary)] text-lg">
                {f.icon}
              </div>
              <span className="text-[var(--text-xs)] font-semibold text-[var(--color-secondary)] text-center">
                {t(f.label)}
              </span>
              {f.desc && (
                <span className="text-[11px] text-[var(--color-text-secondary)] text-center leading-[1.4]">
                  {t(f.desc)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IllustrationPanel;
