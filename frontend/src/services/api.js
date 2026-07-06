import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue = [];
let isRedirecting = false;

/* NEW: sécurisation retry refresh */
let refreshAttempted = false;

/* CSRF */
const getCsrfToken = () => {
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match ? match[1] : null;
};

/* REQUEST INTERCEPTOR */
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const csrfToken = getCsrfToken();

  if (
    csrfToken &&
    !['get', 'head', 'options'].includes(config.method?.toLowerCase())
  ) {
    config.headers['x-csrf-token'] = csrfToken;
  }

  return config;
});

/* QUEUE */
const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });

  failedQueue = [];
};

/* NEW: normalize URL */
const normalizeUrl = (url = '') => {
  return url.replace(import.meta.env.VITE_API_URL || '/api', '');
};

/* RESPONSE INTERCEPTOR */
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      error.friendlyMessage = 'Impossible de contacter le serveur';
      return Promise.reject(error);
    }

    /* RATE LIMIT HANDLING (NEW) */
    if (error.response.status === 429) {
      toast.error(error.response.data?.message || 'Trop de requêtes');
      return Promise.reject(error);
    }

    /* REDIRECTION SAFETY */
    if (isRedirecting) {
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    /* 🟢 NEW: safer URL check */
    const url = normalizeUrl(originalRequest.url || '');

    if (
      url.includes('/auth/refresh') ||
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/forgot-password') ||
      url.includes('/auth/reset-password') ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    /* 401 HANDLING */
    if (error.response.status === 401) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api.request(originalRequest)); // 🔧 FIXED
      }

      /* 🟢 NEW: prevent infinite refresh loop */
      if (refreshAttempted) {
        isRedirecting = true;
        window.location.href = '/login';
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;
      refreshAttempted = true;

      try {
        await api.post('/auth/refresh');

        refreshAttempted = false;

        processQueue(null);
        return api.request(originalRequest); // 🔧 FIXED
      } catch (refreshError) {
        isRedirecting = true;
        refreshAttempted = false;

        processQueue(refreshError);
        window.location.href = '/login';

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    /* 403 HANDLING */
    if (error.response.status === 403) {
      toast.error(error.response.data?.message || 'Accès refusé');
      window.dispatchEvent(new CustomEvent('auth:forbidden'));
    }

    return Promise.reject(error);
  }
);

export default api;