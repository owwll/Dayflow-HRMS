import api from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { AttendanceRecord, AttendanceHistory, ApiResponse, LocationData } from '../types';

export const attendanceService = {
    /**
     * Check in with location
     */
    checkIn: async (location: LocationData): Promise<{ checkInTime: string; attendanceId: string }> => {
        const response = await api.post<ApiResponse<{ checkInTime: string; attendanceId: string }>>(API_ENDPOINTS.CHECK_IN, {
            location,
            deviceInfo: navigator.userAgent,
        });
        return response.data.data!;
    },

    /**
     * Check out with location and attendance ID (optional)
     */
    checkOut: async (attendanceId: string | null, location: LocationData): Promise<{ checkOutTime: string; workHours: number; extraHours: number }> => {
        const response = await api.post<ApiResponse<{ checkOutTime: string; workHours: number; extraHours: number }>>(API_ENDPOINTS.CHECK_OUT, {
            ...(attendanceId && { attendanceId }),
            location,
        });
        return response.data.data!;
    },

    /**
     * Get attendance records for a month
     * @param month - Month in YYYY-MM format
     * @param page - Page number
     * @param limit - Number of records per page
     * @param employeeId - Optional employee ID (for admin to view specific employee)
     */
    getAttendanceRecords: async (month?: string, page: number = 1, limit: number = 30, employeeId?: string): Promise<AttendanceHistory> => {
        const response = await api.get<ApiResponse<AttendanceHistory>>(API_ENDPOINTS.ATTENDANCE, {
            params: { month, page, limit, ...(employeeId && { employeeId }) },
        });
        return response.data.data!;
    },
};
