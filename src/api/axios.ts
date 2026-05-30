import axios from 'axios';
import { API_BASE } from '../lib/constants';
import { useAuthStore } from '../stores/authStore';

export const api = axios.create({
  baseURL: API_BASE,  // now '' (empty string)
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor – add access token from Zustand
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor – refresh token flow (refresh token in cookie)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Backend reads refreshToken from cookie
        const response = await api.post('/auth/refresh', {});
        const { accessToken } = response.data;
        useAuthStore.getState().setAccessToken(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);