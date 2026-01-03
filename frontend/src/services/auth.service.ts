import api from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';
import { AuthResponse, LoginResponse, ApiResponse } from '../types';

export const authService = {
    /**
     * Login - Step 1: Email and Password
     */
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await api.post<ApiResponse<LoginResponse>>(
            API_ENDPOINTS.LOGIN,
            { email, password }
        );

        // Store temp token
        if (response.data.data?.tempToken) {
            localStorage.setItem(STORAGE_KEYS.TEMP_TOKEN, response.data.data.tempToken);
        }

        return response.data.data!;
    },

    /**
     * Verify OTP - Step 2
     */
    verifyOTP: async (otp: string): Promise<AuthResponse> => {
        const tempToken = localStorage.getItem(STORAGE_KEYS.TEMP_TOKEN);

        const response = await api.post<ApiResponse<AuthResponse>>(
            API_ENDPOINTS.VERIFY_OTP,
            { otp },
            {
                headers: {
                    Authorization: `Bearer ${tempToken}`,
                },
            }
        );

        const { accessToken, refreshToken, user } = response.data.data!;

        // Store tokens and user data
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        localStorage.removeItem(STORAGE_KEYS.TEMP_TOKEN);

        return response.data.data!;
    },

    /**
     * Change Password
     */
    changePassword: async (
        oldPassword: string,
        newPassword: string,
        confirmPassword: string
    ): Promise<void> => {
        await api.put(API_ENDPOINTS.CHANGE_PASSWORD, {
            oldPassword,
            newPassword,
            confirmPassword,
        });
    },

    /**
     * Refresh Token
     */
    refreshToken: async (): Promise<string> => {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        const response = await api.post<ApiResponse<{ accessToken: string }>>(
            API_ENDPOINTS.REFRESH_TOKEN,
            { refreshToken }
        );

        const { accessToken } = response.data.data!;
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

        return accessToken;
    },

    /**
     * Logout
     */
    logout: (): void => {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        localStorage.removeItem(STORAGE_KEYS.TEMP_TOKEN);
    },

    /**
     * Get stored user data
     */
    getStoredUser: () => {
        const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        return userData ? JSON.parse(userData) : null;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    },
};
