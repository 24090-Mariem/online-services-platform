import AdminPageLayout from '../../components/layout/AdminPageLayout';

export default function Systeme() {
  return (
    <AdminPageLayout title="Statut du système">
      <div className="flex items-center gap-3">
        <span className="w-3 h-3 rounded-full bg-[var(--color-success)]" />
        <span className="text-base text-[var(--color-text-secondary)]">
          Tous les services sont opérationnels
        </span>
      </div>
    </AdminPageLayout>
  );
}
