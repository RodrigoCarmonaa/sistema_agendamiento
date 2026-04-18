import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarCheck, User, Mail, Lock } from 'lucide-react';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Las contraseñas no coinciden'); return; }
    setLoading(true);
    try {
      await authApi.register({ nombre: form.nombre, email: form.email, telefono: form.telefono, password: form.password });
      toast.success('Cuenta creada. Inicia sesión.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.detail ?? 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <CalendarCheck size={28} color="white" />
          </div>
          <h1 className="auth-title">Crear cuenta</h1>
          <p className="auth-subtitle">Únete a AgendaPro</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {[
            { key: 'nombre',   label: 'Nombre completo',       type: 'text',     icon: User,  ph: 'Juan Pérez' },
            { key: 'email',    label: 'Correo electrónico',    type: 'email',    icon: Mail,  ph: 'correo@ejemplo.com' },
            { key: 'telefono', label: 'Teléfono (opcional)',    type: 'tel',      icon: null,  ph: '+56 9 1234 5678' },
            { key: 'password', label: 'Contraseña',            type: 'password', icon: Lock,  ph: '••••••••' },
            { key: 'confirm',  label: 'Confirmar contraseña',  type: 'password', icon: Lock,  ph: '••••••••' },
          ].map(({ key, label, type, icon: Icon, ph }) => (
            <div className="form-group" key={key}>
              <label className="form-label">{label}</label>
              <div style={{ position: 'relative' }}>
                {Icon && <Icon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />}
                <input
                  type={type}
                  className="form-input"
                  style={{ paddingLeft: Icon ? 38 : 14 }}
                  value={(form as any)[key]}
                  onChange={set(key)}
                  placeholder={ph}
                  required={key !== 'telefono'}
                />
              </div>
            </div>
          ))}

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? <div className="spinner" /> : 'Crear cuenta'}
          </button>
        </form>

        <div className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login" className="auth-link">Iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
}
