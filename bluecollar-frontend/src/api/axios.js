import axios from 'axios';

/**
 * Shared Axios instance for all customer-facing API calls.
 *
 * - baseURL is read from VITE_API_BASE_URL at build time.
 * - Request interceptor attaches the customer JWT (bluecollar_token) as Bearer.
 * - Response interceptor normalises error shapes so callers receive a
 *   consistent Error object with a human-readable `.message`.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// ── Request interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bluecollar_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'An unexpected error occurred.';

    // Auto-clear token and user on 401 so stale sessions don't silently persist
    if (error?.response?.status === 401) {
      localStorage.removeItem('bluecollar_token');
      localStorage.removeItem('bluecollar_user');
    }

    const err = new Error(message);
    err.status = error?.response?.status;
    err.errors = error?.response?.data?.errors ?? null;
    return Promise.reject(err);
  },
);

export default apiClient;
