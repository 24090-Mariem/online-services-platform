import React from 'react';

const InputField = React.forwardRef(
  ({ label, id, icon, error, success, className = '', ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-sm font-semibold text-[var(--color-text)]" htmlFor={id}>
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-4 text-[var(--color-text-muted)] text-base pointer-events-none">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            className={`w-full py-[13px] ${icon ? 'pl-[44px]' : 'px-4'} pr-4 border-[1.5px] rounded-[var(--radius-md)] bg-[var(--color-surface)] font-body text-sm text-[var(--color-text)] outline-none transition-[border-color,box-shadow,background] duration-[var(--transition-fast)]
              placeholder:text-[var(--color-text-muted)]
              focus:border-[var(--color-secondary)] focus:shadow-[var(--shadow-input-focus)] focus:bg-[var(--color-background)]
              ${error ? 'border-[var(--color-error)]' : ''}
              ${success ? 'border-[var(--color-success)]' : ''}
              ${className}`}
            {...rest}
          />
        </div>

        {error && (
          <span className="text-[var(--text-xs)] text-[var(--color-error)] flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </span>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
export default InputField;
