import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { AUTH_TOKEN_KEYS, buildAuthHeader } from './auth-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://cdmsbackend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60s timeout to handle Render cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEYS.access);
    Object.assign(config.headers, buildAuthHeader(token));
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEYS.refresh);
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          await SecureStore.setItemAsync(AUTH_TOKEN_KEYS.access, accessToken);
          await SecureStore.setItemAsync(AUTH_TOKEN_KEYS.refresh, newRefreshToken);

          Object.assign(originalRequest.headers, buildAuthHeader(accessToken));
          return api(originalRequest);
        }
      } catch (refreshError) {
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEYS.access);
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEYS.refresh);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
