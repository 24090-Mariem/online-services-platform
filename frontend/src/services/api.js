import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const msg = error.response?.data?.message || 'Une erreur est survenue';
    if (status === 401) {
      window.dispatchEvent(new CustomEvent('auth:sessionExpired'));
    }
    if (status === 403) {
      toast.error(msg);
      window.dispatchEvent(new CustomEvent('auth:forbidden'));
    }
    return Promise.reject(error);
  }
);

export default api;
