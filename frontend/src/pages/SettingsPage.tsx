import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Save, User, Lock, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

type Tab = 'profile' | 'security';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [tab, setTab] = useState<Tab>('profile');
  const [profile, setProfile] = useState({ nombre: user?.nombre ?? '', email: user?.email ?? '', telefono: user?.telefono ?? '' });
  const [passwords, setPasswords] = useState({ current: '', newPw: '', confirm: '' });

  const profileMut = useMutation({
    mutationFn: () => api.put(`/users/${user?.id}`, { nombre: profile.nombre, email: profile.email, telefono: profile.telefono }),
    onSuccess: (res) => { updateUser(res.data); toast.success('Perfil actualizado'); },
    onError: (e: any) => toast.error(e.response?.data?.detail ?? 'Error al actualizar'),
  });

  const pwMut = useMutation({
    mutationFn: () => api.put(`/users/${user?.id}`, { password: passwords.newPw }),
    onSuccess: () => { toast.success('Contraseña actualizada'); setPasswords({ current: '', newPw: '', confirm: '' }); },
    onError: (e: any) => toast.error(e.response?.data?.detail ?? 'Error'),
  });

  const handleProfileSave = (e: React.FormEvent) => { e.preventDefault(); profileMut.mutate(); };

  const handlePwSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPw !== passwords.confirm) { toast.error('Las contraseñas no coinciden'); return; }
    if (passwords.newPw.length < 6) { toast.error('Mínimo 6 caracteres'); return; }
    pwMut.mutate();
  };

  const initials = user?.nombre?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  return (
    <div className="animate-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ajustes</h1>
          <p className="page-subtitle">Administra tu cuenta y preferencias</p>
        </div>
      </div>

      <div className="settings-layout">
        {/* Left nav */}
        <div>
          <div className="card">
            {/* Avatar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
              <div className="avatar avatar-lg" style={{ marginBottom: 10 }}>{initials}</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user?.nombre}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.email}</div>
              <span className={`badge badge-role-${user?.role}`} style={{ marginTop: 8 }}>{user?.role}</span>
            </div>

            <div className="settings-nav">
              {[
                { key: 'profile',  label: 'Perfil',     icon: User },
                { key: 'security', label: 'Seguridad',  icon: Lock },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  className={`settings-nav-item${tab === key ? ' active' : ''}`}
                  onClick={() => setTab(key as Tab)}
                >
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          {tab === 'profile' && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <User size={18} color="var(--primary)" />
                <h2 style={{ fontSize: '1.1rem' }}>Información de perfil</h2>
              </div>
              <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Nombre completo</label>
                    <input className="form-input" value={profile.nombre} onChange={(e) => setProfile((p) => ({ ...p, nombre: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input className="form-input" value={profile.telefono} onChange={(e) => setProfile((p) => ({ ...p, telefono: e.target.value }))} placeholder="+56 9..." />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Correo electrónico</label>
                  <input type="email" className="form-input" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Rol</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <Shield size={15} color="var(--primary)" />
                    <span style={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>{user?.role}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 4 }}>(no modificable)</span>
                  </div>
                </div>
                <div>
                  <button type="submit" className="btn btn-primary" disabled={profileMut.isPending}>
                    {profileMut.isPending ? <div className="spinner" /> : <><Save size={15} /> Guardar cambios</>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {tab === 'security' && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <Lock size={18} color="var(--primary)" />
                <h2 style={{ fontSize: '1.1rem' }}>Cambiar contraseña</h2>
              </div>
              <form onSubmit={handlePwSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="form-group">
                  <label className="form-label">Nueva contraseña</label>
                  <input type="password" className="form-input" value={passwords.newPw} onChange={(e) => setPasswords((p) => ({ ...p, newPw: e.target.value }))} placeholder="Mínimo 6 caracteres" required minLength={6} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirmar contraseña</label>
                  <input type="password" className="form-input" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} placeholder="Repetir contraseña" required />
                </div>
                <div>
                  <button type="submit" className="btn btn-primary" disabled={pwMut.isPending}>
                    {pwMut.isPending ? <div className="spinner" /> : <><Save size={15} /> Actualizar contraseña</>}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
