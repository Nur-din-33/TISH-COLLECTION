import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors — redirect to login
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Use Next.js router instead of window.location to avoid SSR issues
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────
export const authApi = {
  register:      (data)       => api.post('/auth/register', data),
  verifyEmail:   (data)       => api.post('/auth/verify-email', data),
  resendCode:    (userId)     => api.post('/auth/resend-code', { userId }),
  login:         (data)       => api.post('/auth/login', data),
  googleLogin:   (credential) => api.post('/auth/google', { credential }),
  forgotPassword:(email)      => api.post('/auth/forgot-password', { email }),
  resetPassword: (data)       => api.post('/auth/reset-password', data),
  me:            ()           => api.get('/auth/me'),
};

// ── Products ──────────────────────────────────────────
export const productsApi = {
  getAll:        (params)     => api.get('/products', { params }),
  getOne:        (slug)       => api.get(`/products/${slug}`),
  getCategories: ()           => api.get('/products/categories/all'),
  create:        (data)       => api.post('/products', data),
  update:        (id, data)   => api.patch(`/products/${id}`, data),
};

// ── Orders ────────────────────────────────────────────
export const ordersApi = {
  create: (data) => api.post('/orders', data),
  getAll: ()     => api.get('/orders'),
  getOne: (id)   => api.get(`/orders/${id}`),
};

// ── Payments ──────────────────────────────────────────
export const paymentsApi = {
  initiateMpesa: (data) => api.post('/payments/mpesa/initiate', data),
  checkStatus:   (id)   => api.get(`/payments/mpesa/status/${id}`),
};

// ── Admin ─────────────────────────────────────────────
export const adminApi = {
  getAnalytics:      ()           => api.get('/admin/analytics'),
  getOrders:         (params)     => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, status) => api.patch(`/admin/orders/${id}/status`, { status }),
  getProducts:       ()           => api.get('/admin/products'),
  getSuppliers:      ()           => api.get('/admin/suppliers'),
  deleteProduct:     (id)         => api.delete(`/admin/products/${id}`),
};

export default api;

// ── Upload ─────────────────────────────────────────────
export const uploadApi = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
