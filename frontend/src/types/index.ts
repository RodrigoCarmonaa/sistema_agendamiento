// TypeScript interfaces for the scheduling system

export type UserRole = 'admin' | 'staff' | 'client';

export interface User {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Servicio {
  id: number;
  nombre: string;
  descripcion?: string;
  duracion_minutos: number;
  precio?: number;
  color: string;
  is_active: boolean;
}

export type EstadoCita =
  | 'pendiente'
  | 'confirmada'
  | 'completada'
  | 'cancelada'
  | 'no_asistio';

export interface Cita {
  id: number;
  nombre_cliente: string;
  email_cliente?: string;
  telefono_cliente?: string;
  fecha_hora_inicio: string;
  fecha_hora_fin?: string;
  estado: EstadoCita;
  notas?: string;
  notas_internas?: string;
  servicio_id?: number;
  servicio?: Servicio;
  usuario_id?: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total: number;
  hoy: number;
  semana: number;
  completadas: number;
  pendientes: number;
  confirmadas: number;
  tasa_completado: number;
  weekly_chart: Array<{ fecha: string; dia: string; citas: number }>;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}

export interface CitaFormData {
  nombre_cliente: string;
  email_cliente?: string;
  telefono_cliente?: string;
  fecha_hora_inicio: string;
  fecha_hora_fin?: string;
  notas?: string;
  servicio_id?: number;
}

export interface ServicioFormData {
  nombre: string;
  descripcion?: string;
  duracion_minutos: number;
  precio?: number;
  color: string;
}
