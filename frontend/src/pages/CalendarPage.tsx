import { useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Save, Trash2 } from 'lucide-react';
import { citasApi, serviciosApi } from '../services/api';
import type { Cita, Servicio, EstadoCita } from '../types';
import toast from 'react-hot-toast';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: es }),
  getDay,
  locales: { es },
});

const messages = {
  today: 'Hoy', previous: '‹', next: '›',
  month: 'Mes', week: 'Semana', day: 'Día', agenda: 'Agenda',
  date: 'Fecha', time: 'Hora', event: 'Cita', noEventsInRange: 'Sin citas en este período',
  showMore: (n: number) => `+${n} más`,
};

interface CalEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  cita: Cita;
}

const EMPTY_FORM = { nombre_cliente: '', email_cliente: '', telefono_cliente: '', fecha_hora_inicio: '', fecha_hora_fin: '', notas: '', servicio_id: '' };

export default function CalendarPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<'create' | 'view' | null>(null);
  const [selected, setSelected] = useState<Cita | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [isFromCalendar, setIsFromCalendar] = useState(false);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const { data: citas = [] } = useQuery<Cita[]>({
    queryKey: ['citas'],
    queryFn: () => citasApi.list().then((r) => r.data),
    refetchInterval: 60_000,
  });

  const { data: servicios = [] } = useQuery<Servicio[]>({
    queryKey: ['servicios'],
    queryFn: () => serviciosApi.list().then((r) => r.data),
  });

  const createMut = useMutation({
    mutationFn: (data: object) => citasApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['citas'] }); qc.invalidateQueries({ queryKey: ['dashboard-stats'] }); toast.success('Cita creada'); setModal(null); setIsFromCalendar(false); setForm({ ...EMPTY_FORM }); },
    onError: (e: any) => toast.error(e.response?.data?.detail ?? 'Error'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => citasApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['citas'] }); qc.invalidateQueries({ queryKey: ['dashboard-stats'] }); toast.success('Cita eliminada'); setModal(null); },
  });

  const estadoMut = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: string }) => citasApi.changeEstado(id, estado),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['citas'] }); toast.success('Estado actualizado'); setModal(null); },
  });

  const events: CalEvent[] = citas.map((c) => ({
    id: c.id,
    title: `${c.nombre_cliente}${c.servicio ? ' · ' + c.servicio.nombre : ''}`,
    start: new Date(c.fecha_hora_inicio),
    end: c.fecha_hora_fin ? new Date(c.fecha_hora_fin) : new Date(new Date(c.fecha_hora_inicio).getTime() + 60 * 60_000),
    cita: c,
  }));

  const handleSelectSlot = useCallback((slot: SlotInfo) => {
    const dt = slot.start;
    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setForm({ ...EMPTY_FORM, fecha_hora_inicio: local });
    setIsFromCalendar(true);
    setModal('create');
  }, []);

  const handleSelectEvent = useCallback((ev: CalEvent) => {
    setSelected(ev.cita);
    setModal('view');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      servicio_id: form.servicio_id ? Number(form.servicio_id) : null,
      fecha_hora_fin: form.fecha_hora_fin || null,
    };
    createMut.mutate(payload);
  };

  const eventStyleGetter = (ev: CalEvent) => {
    const color = ev.cita.servicio?.color ?? '#7c3aed';
    return {
      style: { background: color, borderRadius: 4, border: 'none', padding: '2px 6px', fontSize: '0.76rem', fontWeight: 500, boxShadow: `0 2px 6px ${color}50` },
    };
  };

  const stateBadgeColor: Record<string, string> = {
    pendiente: '#f59e0b', confirmada: '#3b82f6', completada: '#22c55e', cancelada: '#ef4444', no_asistio: '#6366f1',
  };

  const ESTADOS: EstadoCita[] = ['pendiente', 'confirmada', 'completada', 'cancelada', 'no_asistio'];

  return (
    <div className="animate-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendario</h1>
          <p className="page-subtitle">Haz clic en un día para crear una cita</p>
        </div>
        <button className="btn btn-primary" id="new-cita-btn" onClick={() => { setForm({ ...EMPTY_FORM }); setIsFromCalendar(false); setModal('create'); }}>
          <Plus size={16} /> Nueva cita
        </button>
      </div>

      <div className="card" style={{ padding: 0, minHeight: 600 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 650, padding: 8 }}
          messages={messages}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent as any}
          view={view}
          onView={(v) => setView(v as any)}
          eventPropGetter={eventStyleGetter as any}
          popup
        />
      </div>

      {modal === 'create' && (
        <div className="modal-overlay" onClick={() => { setModal(null); setIsFromCalendar(false); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h3 className="modal-title">Nueva cita</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => { setModal(null); setIsFromCalendar(false); }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Nombre cliente *</label>
                    <input className="form-input" required value={form.nombre_cliente} onChange={(e) => setForm((f) => ({ ...f, nombre_cliente: e.target.value }))} placeholder="Juan Pérez" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input className="form-input" value={form.telefono_cliente} onChange={(e) => setForm((f) => ({ ...f, telefono_cliente: e.target.value }))} placeholder="+56 9..." />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Correo</label>
                  <input type="email" className="form-input" value={form.email_cliente} onChange={(e) => setForm((f) => ({ ...f, email_cliente: e.target.value }))} placeholder="cliente@mail.com" />
                </div>
                
                {isFromCalendar ? (
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Hora inicio *</label>
                      <input 
                        type="time" 
                        className="form-input" 
                        required 
                        value={form.fecha_hora_inicio.slice(11, 16)} 
                        onChange={(e) => {
                          const dateStr = form.fecha_hora_inicio.slice(0, 10);
                          setForm((f) => ({ ...f, fecha_hora_inicio: `${dateStr}T${e.target.value}` }));
                        }} 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Hora fin</label>
                      <input 
                        type="time" 
                        className="form-input" 
                        value={form.fecha_hora_fin ? form.fecha_hora_fin.slice(11, 16) : ''} 
                        onChange={(e) => {
                          const dateStr = form.fecha_hora_inicio.slice(0, 10);
                          setForm((f) => ({ ...f, fecha_hora_fin: e.target.value ? `${dateStr}T${e.target.value}` : '' }));
                        }} 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Inicio *</label>
                      <input type="datetime-local" className="form-input" required value={form.fecha_hora_inicio} onChange={(e) => setForm((f) => ({ ...f, fecha_hora_inicio: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Fin</label>
                      <input type="datetime-local" className="form-input" value={form.fecha_hora_fin} onChange={(e) => setForm((f) => ({ ...f, fecha_hora_fin: e.target.value }))} />
                    </div>
                  </div>
                )}
                
                <div className="form-group">
                  <label className="form-label">Servicio</label>
                  <select className="form-input" value={form.servicio_id} onChange={(e) => setForm((f) => ({ ...f, servicio_id: e.target.value }))}>
                    <option value="">Sin servicio específico</option>
                    {servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre} ({s.duracion_minutos} min)</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Notas</label>
                  <textarea className="form-input" rows={3} value={form.notas} onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))} placeholder="Información adicional..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setModal(null); setIsFromCalendar(false); }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={createMut.isPending}>
                  {createMut.isPending ? <div className="spinner" /> : <><Save size={15} /> Guardar cita</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'view' && selected && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{selected.nombre_cliente}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                <span className={`badge badge-${selected.estado}`}>{selected.estado.replace('_', ' ')}</span>
                {selected.servicio && (
                  <span className="badge" style={{ background: `${selected.servicio.color}20`, color: selected.servicio.color, border: `1px solid ${selected.servicio.color}40` }}>
                    {selected.servicio.nombre}
                  </span>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { l: 'Email', v: selected.email_cliente },
                  { l: 'Teléfono', v: selected.telefono_cliente },
                  { l: 'Inicio', v: format(new Date(selected.fecha_hora_inicio), 'd MMM yyyy HH:mm', { locale: es }) },
                  { l: 'Fin', v: selected.fecha_hora_fin ? format(new Date(selected.fecha_hora_fin), 'd MMM yyyy HH:mm', { locale: es }) : '—' },
                ].map(({ l, v }) => (
                  <div key={l}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: '0.875rem' }}>{v || '—'}</div>
                  </div>
                ))}
              </div>
              {selected.notas && <div><div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Notas</div><p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{selected.notas}</p></div>}
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>Cambiar estado</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {ESTADOS.map((st) => (
                    <button key={st} className="btn btn-sm" style={{ background: `${stateBadgeColor[st]}20`, color: stateBadgeColor[st], border: `1px solid ${stateBadgeColor[st]}30`, opacity: selected.estado === st ? 1 : 0.6 }}
                      onClick={() => estadoMut.mutate({ id: selected.id, estado: st })}
                    >{st.replace('_', ' ')}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger" onClick={() => { if (confirm('¿Eliminar cita?')) deleteMut.mutate(selected.id); }}>
                <Trash2 size={15} /> Eliminar
              </button>
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
