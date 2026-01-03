import api from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { DashboardData, ApiResponse } from '../types';

export const dashboardService = {
    /**
     * Get dashboard data based on user role
     */
    getDashboardData: async (): Promise<DashboardData> => {
        const response = await api.get<ApiResponse<DashboardData>>(API_ENDPOINTS.DASHBOARD);
        return response.data.data!;
    },
};
