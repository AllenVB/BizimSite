import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:5223/api';

const api = axios.create({ baseURL: BASE_URL });

// Her isteğe JWT token ve tenant header ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (user.tenantSlug) config.headers['X-Tenant-Slug'] = user.tenantSlug;
  return config;
});

// 401 gelirse login'e yönlendir
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// AUTH
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const selfRegister = (data) => api.post('/auth/self-register', data);
export const sendVerificationCode = (data) => api.post('/auth/send-code', data);

// USERS
export const getUsers = () => api.get('/users');
export const getAdmins = () => api.get('/users/admins');
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// ANNOUNCEMENTS
export const getAnnouncements = () => api.get('/announcements');
export const createAnnouncement = (data) => api.post('/announcements', data);
export const deleteAnnouncement = (id) => api.delete(`/announcements/${id}`);

// COMPLAINTS
export const getComplaints = () => api.get('/complaints');
export const createComplaint = (data) => api.post('/complaints', data);
export const updateComplaint = (id, data) => api.put(`/complaints/${id}`, data);

// PAYMENTS
export const getPayments = () => api.get('/payments');
export const makePayment = (data) => api.post('/payments', data);
export const updatePaymentStatus = (id, status, adminNote) => api.put(`/payments/${id}/status`, { status, adminNote });

// EXPENSES
export const getExpenses = () => api.get('/expenses');
export const createExpense = (data) => api.post('/expenses', data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

// MESSAGES
export const getMessages = () => api.get('/messages');
export const sendMessage = (text) => api.post('/messages', JSON.stringify(text), { headers: { 'Content-Type': 'application/json' } });

// GARBAGE
export const getGarbage = () => api.get('/garbage');
export const markGarbage = () => api.post('/garbage/mark');
export const unmarkGarbage = () => api.delete('/garbage/unmark');
export const collectGarbage = (id) => api.put(`/garbage/${id}/collect`);

// BORROW
export const getBorrowRequests = () => api.get('/borrow');
export const createBorrowRequest = (data) => api.post('/borrow', data);
export const respondBorrow = (id, data) => api.post(`/borrow/${id}/respond`, data);

// BLOCKS
export const getBlocks = () => api.get('/blocks');
export const createBlock = (data) => api.post('/blocks', data);
export const updateBlock = (id, data) => api.put(`/blocks/${id}`, data);
export const deleteBlock = (id) => api.delete(`/blocks/${id}`);

// AIDAT
export const getAidatConfig = () => api.get('/aidat/config');
export const updateAidatConfig = (data) => api.put('/aidat/config', data);
export const startNewMonth = (data) => api.post('/aidat/new-month', data);
export const rollbackMonth = () => api.post('/aidat/rollback-month');

// SUPERADMIN
export const getSuperAdminDashboard = () => api.get('/superadmin/dashboard');
export const getTenants = () => api.get('/superadmin/tenants');
export const createTenant = (data) => api.post('/superadmin/tenants', data);
export const updateTenant = (id, data) => api.put(`/superadmin/tenants/${id}`, data);
export const deleteTenant = (id) => api.delete(`/superadmin/tenants/${id}`);
export const getTenantUsers = (id) => api.get(`/superadmin/tenants/${id}/users`);
export const getAllSuperAdminUsers = () => api.get('/superadmin/users');
export const resetUserPassword = (id, newPassword) => api.put(`/superadmin/users/${id}/reset-password`, { newPassword });
export const seedSuperAdmin = () => api.post('/superadmin/seed');

// FEEDBACK
export const submitFeedback = (data) => api.post('/feedback', data);
export const getFeedbacks = () => api.get('/feedback');
export const updateFeedbackStatus = (id, data) => api.put(`/feedback/${id}`, data);

export default api;
