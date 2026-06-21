import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue = [];
let isRedirecting = false;

const getCsrfToken = () => {
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match ? match[1] : null;
};

api.interceptors.request.use((config) => {
  const csrfToken = getCsrfToken();
  if (csrfToken && !['get', 'head', 'options'].includes(config.method?.toLowerCase())) {
    config.headers['x-csrf-token'] = csrfToken;
  }
  return config;
});

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      error.friendlyMessage = 'Impossible de contacter le serveur';
      return Promise.reject(error);
    }

    if (isRedirecting) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    if (originalRequest.url === '/auth/refresh' || originalRequest._retry || originalRequest.url === '/auth/login' || originalRequest.url === '/auth/register' || originalRequest.url === '/auth/me' || originalRequest.url === '/auth/forgot-password' || originalRequest.url === '/auth/reset-password') {
      return Promise.reject(error);
    }

    if (error.response.status === 401) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        isRedirecting = true;
        processQueue(refreshError);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const loginUser = (email, password) => api.post('/auth/login', { email, password });
export const registerUser = (data) => api.post('/auth/register', data);
export const refreshToken = () => api.post('/auth/refresh');
export const logoutUser = () => api.post('/auth/logout');
export const getCurrentUser = () => api.get('/auth/me');

export default api;
