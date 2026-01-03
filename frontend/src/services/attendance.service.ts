import api from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { AttendanceRecord, AttendanceHistory, ApiResponse, LocationData } from '../types';

export const attendanceService = {
    /**
     * Check in with location
     */
    checkIn: async (location: LocationData): Promise<AttendanceRecord> => {
        const response = await api.post<ApiResponse<AttendanceRecord>>(API_ENDPOINTS.CHECK_IN, {
            location,
            deviceInfo: navigator.userAgent,
        });
        return response.data.data!;
    },

    /**
     * Check out with location and attendance ID
     */
    checkOut: async (attendanceId: string, location: LocationData): Promise<AttendanceRecord> => {
        const response = await api.post<ApiResponse<AttendanceRecord>>(API_ENDPOINTS.CHECK_OUT, {
            attendanceId,
            location,
        });
        return response.data.data!;
    },

    /**
     * Get attendance records for a month
     */
    getAttendanceRecords: async (month?: string, page: number = 1, limit: number = 30): Promise<AttendanceHistory> => {
        const response = await api.get<ApiResponse<AttendanceHistory>>(API_ENDPOINTS.ATTENDANCE, {
            params: { month, page, limit },
        });
        return response.data.data!;
    },
};
