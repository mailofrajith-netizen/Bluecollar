import axios from 'axios';

const adminClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 15000,
});

adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('bluecollar_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('bluecollar_admin_token');
      localStorage.removeItem('bluecollar_admin_user');
      window.location.href = '/admin/login';
    }
    const message = err?.response?.data?.message || err?.message || 'An error occurred.';
    return Promise.reject(new Error(message));
  }
);

export const adminLogin = (data) => adminClient.post('/api/admin/auth/login', data);

export const getAdminProducts = (params) =>
  adminClient.get('/api/admin/products', { params });
export const createProduct = (formData) =>
  adminClient.post('/api/admin/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProduct = (id, data) =>
  adminClient.put(`/api/admin/products/${id}`, data);
export const deleteProduct = (id) => adminClient.delete(`/api/admin/products/${id}`);
export const addProductImage = (productId, formData) =>
  adminClient.post(`/api/admin/products/${productId}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteProductImage = (productId, imageId) =>
  adminClient.delete(`/api/admin/products/${productId}/images/${imageId}`);
export const addVariant = (productId, data) =>
  adminClient.post(`/api/admin/products/${productId}/variants`, data);
export const updateVariant = (productId, variantId, data) =>
  adminClient.put(`/api/admin/products/${productId}/variants/${variantId}`, data);
export const deleteVariant = (productId, variantId) =>
  adminClient.delete(`/api/admin/products/${productId}/variants/${variantId}`);

export const getAdminOrders  = (params) => adminClient.get('/api/admin/orders', { params });
export const getAdminOrder   = (id)     => adminClient.get(`/api/admin/orders/${id}`);
export const updateOrderStatus = (id, data) => adminClient.put(`/api/admin/orders/${id}/status`, data);

export const getAdminUsers = (params) => adminClient.get('/api/admin/users', { params });

export const getAdminInvoices = (params) => adminClient.get('/api/admin/invoices', { params });
export const downloadInvoice  = (orderId) =>
  adminClient.get(`/api/admin/invoices/${orderId}/download`, { responseType: 'blob' });

export const getSettings    = ()     => adminClient.get('/api/admin/settings');
export const updateSettings = (data) => adminClient.put('/api/admin/settings', data);
