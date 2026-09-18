import apiClient from './axios';

export const register           = (data)  => apiClient.post('/api/auth/register', data);
export const login              = (data)  => apiClient.post('/api/auth/login', data);
export const verifyEmail        = (token) => apiClient.get(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
export const resendVerification = (email) => apiClient.post('/api/auth/resend-verification', { email });
export const getProfile         = ()      => apiClient.get('/api/user/profile');
export const updateProfile      = (data)  => apiClient.put('/api/user/profile', data);
