import AdminPageLayout from '../../components/layout/AdminPageLayout';

export default function Parameters() {
  return (
    <AdminPageLayout title="Paramètres">
      <div className="text-center py-10 text-[var(--color-text-muted)]">
        Les paramètres du compte sont disponibles dans votre profil.
      </div>
    </AdminPageLayout>
  );
}
