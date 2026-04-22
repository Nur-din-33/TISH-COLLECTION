import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ================= REQUEST INTERCEPTOR =================
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('token');

        if (token && token !== "undefined" && token !== "null") {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.error("Token read error:", err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ================= RESPONSE INTERCEPTOR =================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      const status = error.response?.status;

      // Only logout on real unauthorized
      if (status === 401) {
        const token = localStorage.getItem('token');

        if (token) {
          console.warn('Session expired. Logging out...');

          localStorage.removeItem('token');
          localStorage.removeItem('user');

          // small delay avoids redirect loop
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
      }
    }

    return Promise.reject(error);
  }
);

// ================= AUTH =================
export const authApi = {
  register:       (data)       => api.post('/auth/register', data),
  verifyEmail:    (data)       => api.post('/auth/verify-email', data),
  resendCode:     (userId)     => api.post('/auth/resend-code', { userId }),
  login:          (data)       => api.post('/auth/login', data),
  googleLogin:    (credential) => api.post('/auth/google', { credential }),
  forgotPassword: (email)      => api.post('/auth/forgot-password', { email }),
  resetPassword:  (data)       => api.post('/auth/reset-password', data),
  me:             ()           => api.get('/auth/me'),
};

// ================= PRODUCTS =================
export const productsApi = {
  getAll:        (params)     => api.get('/products', { params }),
  getOne:        (slug)       => api.get(`/products/${slug}`),
  getCategories: ()           => api.get('/products/categories/all'),
  create:        (data)       => api.post('/products', data),
  update:        (id, data)   => api.patch(`/products/${id}`, data),
};

// ================= ORDERS =================
export const ordersApi = {
  create: (data) => api.post('/orders', data),
  getAll: ()     => api.get('/orders'),
  getOne: (id)   => api.get(`/orders/${id}`),
};

// ================= PAYMENTS =================
export const paymentsApi = {
  initiateMpesa: (data) => api.post('/payments/mpesa/initiate', data),
  checkStatus:   (id)   => api.get(`/payments/mpesa/status/${id}`),
};

// ================= ADMIN =================
export const adminApi = {
  getAnalytics:      ()             => api.get('/admin/analytics'),
  getOrders:         (params)       => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, status)   => api.patch(`/admin/orders/${id}/status`, { status }),
  getProducts:       ()             => api.get('/admin/products'),
  deleteProduct:     (id)           => api.delete(`/admin/products/${id}`),
};

export default api;