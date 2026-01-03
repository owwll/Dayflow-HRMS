import axios, { AxiosError } from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';
import type { ApiResponse } from '../types';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in development
        if (import.meta.env.DEV) {
            console.log('API Request:', {
                method: config.method?.toUpperCase(),
                url: config.url,
                data: config.data,
            });
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
        // Log response in development
        if (import.meta.env.DEV) {
            console.log('API Response:', {
                status: response.status,
                data: response.data,
            });
        }

        return response;
    },
    async (error: AxiosError<ApiResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Log error in development
        if (import.meta.env.DEV) {
            console.error('API Error:', {
                status: error.response?.status,
                message: error.response?.data?.error?.message || error.message,
                url: error.config?.url,
            });
        }

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
                        refreshToken,
                    });

                    const { accessToken } = response.data.data;
                    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

                    // Retry original request with new token
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    }
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, logout user
                localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER_DATA);
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
