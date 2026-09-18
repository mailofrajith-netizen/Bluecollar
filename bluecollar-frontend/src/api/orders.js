import apiClient from './axios';

export const placeOrder = (data)   => apiClient.post('/api/orders', data);
export const getOrders  = (params) => apiClient.get('/api/orders', { params });
export const getOrder   = (id)     => apiClient.get(`/api/orders/${id}`);
export const trackOrder = (params) => apiClient.get('/api/orders/track', { params });
export const getInvoice = (id)     => apiClient.get(`/api/orders/${id}/invoice`, { responseType: 'blob' });
