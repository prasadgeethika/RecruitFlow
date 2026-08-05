import { Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

export default function DashboardLayout() {
  const { email, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`app-shell ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <header className="topbar">
        <button className="topbar-menu" onClick={() => setSidebarOpen((open) => !open)}>
          <span />
          <span />
          <span />
        </button>
        <div className="topbar-spacer" />
        <div className="topbar-meta">
          <span className="topbar-signed-in">Signed in as <strong>{email ?? 'Unknown user'}</strong></span>
          <button className="topbar-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="dashboard-body">
        <aside className="sidebar">
          <Navbar />
        </aside>
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
