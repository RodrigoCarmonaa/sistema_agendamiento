import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ───────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: object) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// ── Citas ──────────────────────────────────────────────
export const citasApi = {
  list: (params?: object) => api.get('/citas', { params }),
  create: (data: object) => api.post('/citas', data),
  get: (id: number) => api.get(`/citas/${id}`),
  update: (id: number, data: object) => api.put(`/citas/${id}`, data),
  changeEstado: (id: number, estado: string) =>
    api.patch(`/citas/${id}/estado`, null, { params: { estado } }),
  delete: (id: number) => api.delete(`/citas/${id}`),
};

// ── Servicios ──────────────────────────────────────────
export const serviciosApi = {
  list: () => api.get('/servicios'),
  create: (data: object) => api.post('/servicios', data),
  update: (id: number, data: object) => api.put(`/servicios/${id}`, data),
  delete: (id: number) => api.delete(`/servicios/${id}`),
};

// ── Dashboard ──────────────────────────────────────────
export const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
};

export default api;
