import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Save, Trash2, Search, Filter, Edit2 } from 'lucide-react';
import { citasApi, serviciosApi } from '../services/api';
import type { Cita, Servicio, EstadoCita } from '../types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

const ESTADO_OPTS: EstadoCita[] = ['pendiente', 'confirmada', 'completada', 'cancelada', 'no_asistio'];
const EMPTY_FORM = { nombre_cliente: '', email_cliente: '', telefono_cliente: '', fecha_hora_inicio: '', fecha_hora_fin: '', notas: '', servicio_id: '' };

export default function AppointmentsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Cita | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('');

  const { data: citas = [], isLoading } = useQuery<Cita[]>({
    queryKey: ['citas'],
    queryFn: () => citasApi.list().then((r) => r.data),
  });

  const { data: servicios = [] } = useQuery<Servicio[]>({
    queryKey: ['servicios'],
    queryFn: () => serviciosApi.list().then((r) => r.data),
  });

  const createMut = useMutation({
    mutationFn: (d: object) => citasApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['citas'] }); qc.invalidateQueries({ queryKey: ['dashboard-stats'] }); toast.success('Cita creada'); closeModal(); },
    onError: (e: any) => toast.error(e.response?.data?.detail ?? 'Error al crear'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, d }: { id: number; d: object }) => citasApi.update(id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['citas'] }); toast.success('Cita actualizada'); closeModal(); },
    onError: (e: any) => toast.error(e.response?.data?.detail ?? 'Error al actualizar'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => citasApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['citas'] }); qc.invalidateQueries({ queryKey: ['dashboard-stats'] }); toast.success('Cita eliminada'); },
  });

  const estadoMut = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: string }) => citasApi.changeEstado(id, estado),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['citas'] }); toast.success('Estado actualizado'); },
  });

  const closeModal = () => { setModal(null); setEditing(null); setForm({ ...EMPTY_FORM }); };

  const openCreate = () => { setForm({ ...EMPTY_FORM }); setModal('create'); };

  const openEdit = (c: Cita) => {
    const toLocal = (dt: string) => new Date(new Date(dt).getTime() - new Date(dt).getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setForm({
      nombre_cliente: c.nombre_cliente,
      email_cliente: c.email_cliente ?? '',
      telefono_cliente: c.telefono_cliente ?? '',
      fecha_hora_inicio: toLocal(c.fecha_hora_inicio),
      fecha_hora_fin: c.fecha_hora_fin ? toLocal(c.fecha_hora_fin) : '',
      notas: c.notas ?? '',
      servicio_id: c.servicio_id ? String(c.servicio_id) : '',
    });
    setEditing(c);
    setModal('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, servicio_id: form.servicio_id ? Number(form.servicio_id) : null, fecha_hora_fin: form.fecha_hora_fin || null };
    if (modal === 'create') createMut.mutate(payload);
    else if (editing) updateMut.mutate({ id: editing.id, d: payload });
  };

  const filtered = citas.filter((c) => {
    const matchSearch = !search || c.nombre_cliente.toLowerCase().includes(search.toLowerCase()) || c.email_cliente?.toLowerCase().includes(search.toLowerCase());
    const matchEstado = !filterEstado || c.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const FormModal = () => (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h3 className="modal-title">{modal === 'create' ? 'Nueva cita' : 'Editar cita'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={closeModal}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input className="form-input" required value={form.nombre_cliente} onChange={(e) => setForm((f) => ({ ...f, nombre_cliente: e.target.value }))} placeholder="Juan Pérez" />
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input className="form-input" value={form.telefono_cliente} onChange={(e) => setForm((f) => ({ ...f, telefono_cliente: e.target.value }))} placeholder="+56 9..." />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={form.email_cliente} onChange={(e) => setForm((f) => ({ ...f, email_cliente: e.target.value }))} placeholder="cliente@mail.com" />
            </div>
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
            <div className="form-group">
              <label className="form-label">Servicio</label>
              <select className="form-input" value={form.servicio_id} onChange={(e) => setForm((f) => ({ ...f, servicio_id: e.target.value }))}>
                <option value="">Sin servicio</option>
                {servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre} — {s.duracion_minutos} min</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Notas</label>
              <textarea className="form-input" rows={3} value={form.notas} onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))} placeholder="Información adicional..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={createMut.isPending || updateMut.isPending}>
              {(createMut.isPending || updateMut.isPending) ? <div className="spinner" /> : <><Save size={15} /> Guardar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="animate-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Citas</h1>
          <p className="page-subtitle">{filtered.length} cita{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" id="add-cita-btn" onClick={openCreate}><Plus size={16} /> Nueva cita</button>
      </div>

      <div className="filters-bar">
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Buscar por nombre o email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={{ position: 'relative' }}>
          <Filter size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <select className="form-input" style={{ paddingLeft: 32, width: 180 }} value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            {ESTADO_OPTS.map((o) => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-overlay"><div className="spinner spinner-lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p className="empty-state-title">No se encontraron citas</p>
          <p className="empty-state-desc">Crea tu primera cita con el botón de arriba</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Fecha y hora</th>
                <th>Estado</th>
                <th>Cambiar estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.nombre_cliente}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email_cliente ?? '—'}</div>
                  </td>
                  <td>
                    {c.servicio ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.servicio.color }} />
                        {c.servicio.nombre}
                      </span>
                    ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {format(parseISO(c.fecha_hora_inicio), "d MMM yyyy, HH:mm", { locale: es })}
                  </td>
                  <td><span className={`badge badge-${c.estado}`}>{c.estado.replace('_', ' ')}</span></td>
                  <td>
                    <select
                      className="form-input"
                      style={{ padding: '4px 8px', fontSize: '0.78rem', width: 130 }}
                      value={c.estado}
                      onChange={(e) => estadoMut.mutate({ id: c.id, estado: e.target.value })}
                    >
                      {ESTADO_OPTS.map((o) => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-icon btn-sm" title="Editar" onClick={() => openEdit(c)}>
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-danger btn-icon btn-sm"
                        title="Eliminar"
                        onClick={() => { if (confirm(`¿Eliminar cita de ${c.nombre_cliente}?`)) deleteMut.mutate(c.id); }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(modal === 'create' || modal === 'edit') && <FormModal />}
    </div>
  );
}
