import api from './api';
import { API_ENDPOINTS } from '../utils/constants';
import type { ProfileData, ApiResponse } from '../types';

export const profileService = {
    /**
     * Get user profile by ID
     */
    getProfile: async (userId: string): Promise<ProfileData> => {
        const response = await api.get<ApiResponse<ProfileData>>(API_ENDPOINTS.PROFILE(userId));
        return response.data.data!;
    },

    /**
     * Update user profile
     */
    updateProfile: async (userId: string, data: Partial<ProfileData['personal']>): Promise<ProfileData> => {
        const response = await api.put<ApiResponse<ProfileData>>(API_ENDPOINTS.PROFILE(userId), data);
        return response.data.data!;
    },

    /**
     * Upload profile picture
     */
    uploadProfilePic: async (userId: string, file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('profilePic', file);

        const response = await api.post<ApiResponse<{ profilePicUrl: string }>>(
            API_ENDPOINTS.UPLOAD_PROFILE_PIC(userId),
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data.data!.profilePicUrl;
    },
};
