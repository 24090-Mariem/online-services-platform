import { useState } from 'react';
import Navbar from '../navigation/Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children, role = 'admin', user = {}, activePage = 'dashboard', onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleMenuToggle = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background)' }}>
      <Navbar user={user} onMenuToggle={handleMenuToggle} />
      <div style={{ display: 'flex', flex: 1, paddingTop: '64px' }}>
        <Sidebar
          role={role}
          activePage={activePage}
          onNavigate={onNavigate}
          isOpen={sidebarOpen}
        />
        <main style={{ flex: 1, marginLeft: sidebarOpen ? '248px' : '0', padding: 'var(--space-8)', transition: 'margin-left var(--transition-slow)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
