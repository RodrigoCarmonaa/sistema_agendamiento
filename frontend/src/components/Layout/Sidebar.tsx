import { NavLink, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard, Calendar, ClipboardList,
  Briefcase, Settings, LogOut, CalendarCheck,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/calendar',  icon: Calendar,         label: 'Calendario' },
  { to: '/citas',     icon: ClipboardList,    label: 'Citas' },
  { to: '/servicios', icon: Briefcase,        label: 'Servicios' },
  { to: '/settings',  icon: Settings,         label: 'Ajustes' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout();
    queryClient.clear(); // Limpiar todo el caché de React Query
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  const initials = user?.nombre
    ? user.nombre.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <CalendarCheck size={20} color="white" />
        </div>
        <div>
          <div className="sidebar-logo-text">AgendaPro</div>
          <div className="sidebar-logo-sub">Sistema de citas</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="nav-section-label">Menú principal</span>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon className="nav-item-icon" />
            {label}
          </NavLink>
        ))}

        <div className="divider" style={{ margin: '16px 0' }} />

        <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--error)' }}>
          <LogOut className="nav-item-icon" />
          Cerrar sesión
        </button>
      </nav>

      {/* User card */}
      <div className="sidebar-user">
        <NavLink to="/settings" className="sidebar-user-card" style={{ textDecoration: 'none' }}>
          <div className="avatar">{initials}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="user-name">{user?.nombre ?? 'Usuario'}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <Settings size={14} color="var(--text-muted)" />
        </NavLink>
      </div>
    </aside>
  );
}
