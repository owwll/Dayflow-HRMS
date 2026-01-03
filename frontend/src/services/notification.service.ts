import api from './api';
import { API_ENDPOINTS } from '../utils/constants';
import type { Notification, ApiResponse } from '../types';

export interface GetNotificationsParams {
    unreadOnly?: boolean;
    type?: string;
    page?: number;
    limit?: number;
}

export interface GetNotificationsResponse {
    notifications: Notification[];
    unreadCount: number;
}

export const notificationService = {
    /**
     * Get notifications
     */
    getNotifications: async (params?: GetNotificationsParams): Promise<GetNotificationsResponse> => {
        const queryParams = new URLSearchParams();
        
        if (params?.unreadOnly) {
            queryParams.append('unreadOnly', 'true');
        }
        if (params?.type) {
            queryParams.append('type', params.type);
        }
        if (params?.page) {
            queryParams.append('page', params.page.toString());
        }
        if (params?.limit) {
            queryParams.append('limit', params.limit.toString());
        }

        const url = `${API_ENDPOINTS.NOTIFICATIONS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await api.get<ApiResponse<GetNotificationsResponse>>(url);
        return response.data.data!;
    },

    /**
     * Mark notification as read
     */
    markAsRead: async (notificationId: string): Promise<void> => {
        await api.put<ApiResponse>(API_ENDPOINTS.MARK_READ(notificationId));
    },
};

