import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: { email: string; password: string; name: string; phone?: string }) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/me'),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Complaints
export const complaintsApi = {
  create: (data: any) => api.post('/complaints', data),
  findAll: (params?: any) => api.get('/complaints', { params }),
  findById: (id: string) => api.get(`/complaints/${id}`),
  update: (id: string, data: any) => api.patch(`/complaints/${id}`, data),
  updateStatus: (id: string, data: any) => api.post(`/complaints/${id}/status`, data),
  assign: (id: string, data: any) => api.post(`/complaints/${id}/assign`, data),
  addComment: (id: string, data: any) => api.post(`/complaints/${id}/comments`, data),
  uploadAttachment: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/complaints/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id: string) => api.delete(`/complaints/${id}`),
};

// Departments
export const departmentsApi = {
  findAll: () => api.get('/departments'),
  findById: (id: string) => api.get(`/departments/${id}`),
  create: (data: any) => api.post('/departments', data),
  update: (id: string, data: any) => api.patch(`/departments/${id}`, data),
  delete: (id: string) => api.delete(`/departments/${id}`),
};

// Categories
export const categoriesApi = {
  findAll: () => api.get('/categories'),
  findById: (id: string) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.patch(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Users
export const usersApi = {
  findAll: (params?: any) => api.get('/users', { params }),
  findById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
  getStaffByDepartment: (deptId: string) => api.get(`/users/department/${deptId}`),
};

// SLA
export const slaApi = {
  findAll: () => api.get('/sla-rules'),
  update: (id: string, data: any) => api.patch(`/sla-rules/${id}`, data),
};

// Analytics
export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard'),
  trends: (days?: number) => api.get('/analytics/trends', { params: { days } }),
  userStats: () => api.get('/analytics/user'),
  staffStats: () => api.get('/analytics/staff'),
};

// Notifications
export const notificationsApi = {
  findAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export default api;
