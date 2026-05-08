import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FolderKanban, LogOut, Zap } from 'lucide-react';
import { initials } from '../../utils/helpers';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: 'var(--bg-2)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '24px 16px', flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, padding: '0 8px' }}>
          <div style={{ background: 'var(--accent)', borderRadius: 8, padding: 6, display: 'flex' }}>
            <Zap size={16} color="white" fill="white" />
          </div>
          <span style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>
            Task<span style={{ color: 'var(--accent)' }}>Flow</span>
          </span>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {[
            { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/projects', icon: FolderKanban, label: 'Projects' }
          ].map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              borderRadius: 'var(--radius-sm)', fontWeight: 500, fontSize: 14,
              color: isActive ? 'var(--accent-2)' : 'var(--text-2)',
              background: isActive ? 'var(--accent-glow)' : 'transparent',
              transition: 'all 0.15s'
            })}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--accent)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0
            }}>
              {initials(user?.name)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button className="btn-ghost" onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
        <Outlet />
      </main>
    </div>
  );
}
