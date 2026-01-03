import api from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { LeaveRequest, LeaveBalance, LeaveStatus, LeaveType, ApiResponse, PaginationData } from '../types';

export interface LeaveHistoryResponse {
    requests: LeaveRequest[];
    balances: LeaveBalance;
    pagination: PaginationData;
}

export const leaveService = {
    /**
     * Apply for leave
     */
    applyLeave: async (data: {
        leaveType: LeaveType;
        startDate: string;
        endDate: string;
        reason: string;
        attachment?: File;
    }): Promise<LeaveRequest> => {
        const formData = new FormData();
        formData.append('leaveType', data.leaveType);
        formData.append('startDate', data.startDate);
        formData.append('endDate', data.endDate);
        formData.append('reason', data.reason);
        if (data.attachment) {
            formData.append('attachment', data.attachment);
        }

        const response = await api.post<ApiResponse<LeaveRequest>>(API_ENDPOINTS.APPLY_LEAVE, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data!;
    },

    /**
     * Get leave requests
     */
    getLeaveRequests: async (status?: LeaveStatus, page: number = 1, limit: number = 30): Promise<LeaveHistoryResponse> => {
        const response = await api.get<ApiResponse<LeaveHistoryResponse>>(API_ENDPOINTS.LEAVE_REQUESTS, {
            params: { status, page, limit },
        });
        const data = response.data.data!;
        
        // Ensure employee data is properly structured
        if (data.requests) {
            data.requests = data.requests.map((req: any) => {
                // If employee data exists but is in wrong format, normalize it
                if (req.employee && typeof req.employee === 'object') {
                    return {
                        ...req,
                        employee: {
                            id: req.employee.id || '',
                            name: req.employee.name || '',
                            department: req.employee.department || '',
                            employeeCode: req.employee.employeeCode || '',
                        },
                    };
                }
                return req;
            });
        }
        
        return data;
    },

    /**
     * Approve/Reject leave
     */
    approveLeave: async (leaveId: string, action: 'approve' | 'reject', comments?: string): Promise<LeaveRequest> => {
        const response = await api.put<ApiResponse<LeaveRequest>>(API_ENDPOINTS.APPROVE_LEAVE(leaveId), {
            action,
            comments,
        });
        return response.data.data!;
    },
};
