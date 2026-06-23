import PublicNavbar from '../navigation/PublicNavbar';

export default function PublicLayout({ children }) {
  return (
    <>
      <PublicNavbar />
      <main style={{ paddingTop: '64px' }}>
        {children}
      </main>
    </>
  );
}
