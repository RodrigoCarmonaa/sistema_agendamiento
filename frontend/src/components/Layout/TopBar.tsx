import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const routeTitles: Record<string, { title: string; sub: string }> = {
  '/dashboard':  { title: 'Dashboard',    sub: 'Resumen y estadísticas' },
  '/calendar':   { title: 'Calendario',   sub: 'Vista de citas por fecha' },
  '/citas':      { title: 'Citas',        sub: 'Gestión de todas las citas' },
  '/servicios':  { title: 'Servicios',    sub: 'Servicios ofrecidos' },
  '/settings':   { title: 'Ajustes',      sub: 'Configuración de cuenta' },
};

export default function TopBar() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const { title, sub } = routeTitles[location.pathname] ?? { title: 'AgendaPro', sub: '' };

  const now = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{title}</div>
        <div className="topbar-sub">{sub} · {now}</div>
      </div>
      <div className="topbar-actions">
        <button className="btn btn-ghost btn-icon" title="Notificaciones">
          <Bell size={18} />
        </button>
        <div className="avatar">
          {user?.nombre?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'}
        </div>
      </div>
    </header>
  );
}
