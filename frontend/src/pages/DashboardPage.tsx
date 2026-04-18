import { useQuery } from '@tanstack/react-query';
import {
  CalendarDays, CalendarCheck, CheckCircle2, Clock,
  TrendingUp, AlertCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { dashboardApi, citasApi } from '../services/api';
import type { DashboardStats, Cita } from '../types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', fontSize: '0.8rem' }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#a78bfa', fontWeight: 700 }}>{payload[0].value} citas</p>
    </div>
  );
};

function StatusBadge({ estado }: { estado: string }) {
  return <span className={`badge badge-${estado}`}>{estado.replace('_', ' ')}</span>;
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.stats().then((r) => r.data),
    refetchInterval: 30_000,
  });

  const { data: recentCitas } = useQuery<Cita[]>({
    queryKey: ['citas-recent'],
    queryFn: () => citasApi.list({ limit: 8 }).then((r) => r.data),
  });

  if (statsLoading) {
    return <div className="loading-overlay"><div className="spinner spinner-lg" /></div>;
  }

  const statCards = [
    { label: 'Total Citas',     value: stats?.total ?? 0,      icon: CalendarDays,   variant: 'purple' },
    { label: 'Citas Hoy',       value: stats?.hoy ?? 0,        icon: CalendarCheck,  variant: 'blue' },
    { label: 'Esta Semana',     value: stats?.semana ?? 0,     icon: TrendingUp,     variant: 'green' },
    { label: '% Completadas',   value: `${stats?.tasa_completado ?? 0}%`, icon: CheckCircle2, variant: 'orange' },
  ];

  return (
    <div className="animate-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Visión general de tu sistema de citas</p>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map(({ label, value, icon: Icon, variant }) => (
          <div key={label} className={`stat-card ${variant}`}>
            <div className={`stat-icon ${variant}`}><Icon size={20} /></div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 28 }}>
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: '1rem' }}>Citas — Últimos 7 días</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.weekly_chart ?? []} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="dia" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="citas" fill="url(#purpleGrad)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: '1rem' }}>Estado actual</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Pendientes',  value: stats?.pendientes ?? 0,  color: '#f59e0b', icon: Clock },
              { label: 'Confirmadas', value: stats?.confirmadas ?? 0, color: '#60a5fa', icon: CalendarCheck },
              { label: 'Completadas', value: stats?.completadas ?? 0, color: '#4ade80', icon: CheckCircle2 },
              { label: 'Otros',       value: (stats?.total ?? 0) - (stats?.pendientes ?? 0) - (stats?.confirmadas ?? 0) - (stats?.completadas ?? 0), color: '#f87171', icon: AlertCircle },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon size={16} color={color} />
                <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontWeight: 700, color }}>{value}</span>
                <div style={{ width: 80, height: 6, background: 'var(--bg-surface-3)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${stats?.total ? (value / stats.total) * 100 : 0}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem' }}>Próximas citas</h3>
          <a href="/citas" className="btn btn-ghost btn-sm">Ver todas →</a>
        </div>
        {!recentCitas?.length ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <p className="empty-state-title">No hay citas registradas</p>
            <p className="empty-state-desc">Las nuevas citas aparecerán aquí</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Fecha y hora</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentCitas.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.nombre_cliente}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email_cliente}</div>
                    </td>
                    <td>
                      {c.servicio ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.servicio.color, flexShrink: 0 }} />
                          {c.servicio.nombre}
                        </span>
                      ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {format(parseISO(c.fecha_hora_inicio), "d MMM yyyy, HH:mm", { locale: es })}
                    </td>
                    <td><StatusBadge estado={c.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
