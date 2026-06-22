export default function AdminPageLayout({ title, maxWidth = '900px', children }) {
  return (
    <div className="p-6">
      <div
        className="mx-auto bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] border border-[var(--color-border)] p-8"
        style={{ maxWidth }}
      >
        <h1 className="font-display text-[var(--text-xl)] font-bold text-[var(--color-text)] m-0 mb-6">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}
