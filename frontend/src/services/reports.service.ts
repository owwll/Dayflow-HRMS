import api from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { ApiResponse } from '../types';

export interface AttendanceTrend {
    date?: string;
    month?: string;
    present: number;
    absent: number;
    onLeave: number;
    avgAttendance?: number;
    avgOvertime?: number;
}

export interface LeaveAnalytics {
    byType: Array<{
        type: string;
        count: number;
        percentage: number;
    }>;
    byDepartment: Array<{
        department: string;
        leavesTaken: number;
        avgLeaves: number;
    }>;
}

export interface SalaryAnalytics {
    byDepartment: Array<{
        department: string;
        avgSalary: number;
        minSalary: number;
        maxSalary: number;
    }>;
    distribution: {
        [key: string]: number;
    };
}

export interface HRAnalytics {
    attendanceTrends: {
        daily: AttendanceTrend[];
        monthly: AttendanceTrend[];
    };
    leaveAnalytics: LeaveAnalytics;
    salaryAnalytics: SalaryAnalytics;
}

export const reportsService = {
    /**
     * Get HR Analytics data for reports
     */
    getHRAnalytics: async (startDate?: string, endDate?: string, department?: string): Promise<HRAnalytics> => {
        const response = await api.get<ApiResponse<HRAnalytics>>(API_ENDPOINTS.ANALYTICS_HR, {
            params: { startDate, endDate, department },
        });
        return response.data.data!;
    },
};

