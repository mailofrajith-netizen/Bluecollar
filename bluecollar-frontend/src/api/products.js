import apiClient from './axios';

export const getProducts = (params) => apiClient.get('/api/products', { params });
export const getProduct  = (slug)   => apiClient.get(`/api/products/${slug}`);
