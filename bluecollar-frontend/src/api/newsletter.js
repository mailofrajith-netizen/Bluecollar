import apiClient from './axios';

export const subscribe = (email) => apiClient.post('/api/newsletter', { email });
