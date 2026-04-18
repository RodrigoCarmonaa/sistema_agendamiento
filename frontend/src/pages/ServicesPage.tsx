import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Save, Trash2, Clock, DollarSign, Edit2 } from 'lucide-react';
import { serviciosApi } from '../services/api';
import type { Servicio } from '../types';
import toast from 'react-hot-toast';

const COLORS = [
  '#7c3aed', '#4f46e5', '#0ea5e9', '#06b6d4', '#10b981',
  '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6',
];

const EMPTY_FORM = { nombre: '', descripcion: '', duracion_minutos: 60, precio: '', color: '#7c3aed' };

export default function ServicesPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Servicio | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const { data: servicios = [], isLoading } = useQuery<Servicio[]>({
    queryKey: ['servicios'],
    queryFn: () => serviciosApi.list().then((r) => r.data),
  });

  const createMut = useMutation({
    mutationFn: (d: object) => serviciosApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['servicios'] }); toast.success('Servicio creado'); closeModal(); },
    onError: (e: any) => toast.error(e.response?.data?.detail ?? 'Error'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, d }: { id: number; d: object }) => serviciosApi.update(id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['servicios'] }); toast.success('Servicio actualizado'); closeModal(); },
    onError: (e: any) => toast.error(e.response?.data?.detail ?? 'Error'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => serviciosApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['servicios'] }); toast.success('Servicio eliminado'); },
  });

  const closeModal = () => { setModal(null); setEditing(null); setForm({ ...EMPTY_FORM }); };

  const openCreate = () => { setForm({ ...EMPTY_FORM }); setModal('create'); };

  const openEdit = (s: Servicio) => {
    setForm({ nombre: s.nombre, descripcion: s.descripcion ?? '', duracion_minutos: s.duracion_minutos, precio: s.precio ? String(s.precio) : '', color: s.color });
    setEditing(s);
    setModal('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, precio: form.precio ? Number(form.precio) : null };
    if (modal === 'create') createMut.mutate(payload);
    else if (editing) updateMut.mutate({ id: editing.id, d: payload });
  };

  return (
    <div className="animate-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Servicios</h1>
          <p className="page-subtitle">{servicios.length} servicio{servicios.length !== 1 ? 's' : ''} activo{servicios.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" id="add-servicio-btn" onClick={openCreate}><Plus size={16} /> Nuevo servicio</button>
      </div>

      {isLoading ? (
        <div className="loading-overlay"><div className="spinner spinner-lg" /></div>
      ) : servicios.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💼</div>
          <p className="empty-state-title">Sin servicios</p>
          <p className="empty-state-desc">Agrega los servicios que ofreces para asignarlos a las citas</p>
        </div>
      ) : (
        <div className="services-grid">
          {servicios.map((s) => (
            <div key={s.id} className="service-card">
              <div className="service-card-accent" style={{ background: s.color }} />
              <div className="service-card-header">
                <span className="service-color-dot" style={{ background: s.color }} />
                <span className="service-name">{s.nombre}</span>
              </div>
              <p className="service-desc">{s.descripcion || 'Sin descripción'}</p>
              <div className="service-meta">
                <span className="service-meta-item"><Clock size={13} /> {s.duracion_minutos} min</span>
                {s.precio && <span className="service-meta-item"><DollarSign size={13} /> {s.precio.toLocaleString('es-CL')}</span>}
              </div>
              <div className="service-actions">
                <button className="btn btn-ghost btn-icon btn-sm" title="Editar" onClick={() => openEdit(s)}>
                  <Edit2 size={14} />
                </button>
                <button
                  className="btn btn-danger btn-icon btn-sm"
                  title="Eliminar"
                  onClick={() => { if (confirm(`¿Eliminar "${s.nombre}"?`)) deleteMut.mutate(s.id); }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(modal === 'create' || modal === 'edit') && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{modal === 'create' ? 'Nuevo servicio' : 'Editar servicio'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input className="form-input" required value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} placeholder="Consulta inicial" />
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea className="form-input" rows={2} value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} placeholder="Descripción breve del servicio..." />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Duración (minutos) *</label>
                    <input type="number" min={5} max={480} className="form-input" required value={form.duracion_minutos} onChange={(e) => setForm((f) => ({ ...f, duracion_minutos: Number(e.target.value) }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Precio (opcional)</label>
                    <input type="number" min={0} step={0.01} className="form-input" value={form.precio} onChange={(e) => setForm((f) => ({ ...f, precio: e.target.value }))} placeholder="0" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Color del servicio</label>
                  <div className="color-picker-row">
                    {COLORS.map((c) => (
                      <button key={c} type="button" className={`color-swatch${form.color === c ? ' selected' : ''}`} style={{ background: c }} onClick={() => setForm((f) => ({ ...f, color: c }))} title={c} />
                    ))}
                  </div>
                  <div style={{ marginTop: 10, padding: '8px 14px', borderRadius: 8, background: `${form.color}15`, border: `1px solid ${form.color}30`, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: form.color }} />
                    <span style={{ color: form.color, fontWeight: 600 }}>{form.nombre || 'Vista previa del servicio'}</span>
                  </div>
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
      )}
    </div>
  );
}
