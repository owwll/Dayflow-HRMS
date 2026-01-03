import api from './api';
import { API_ENDPOINTS } from '../utils/constants';
import type { Employee, ApiResponse, PaginationResponse } from '../types';
import { Role } from '../types';

export interface EmployeeCreateData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: Role;
    company: string;
    department: string;
    location: string;
    dateOfJoining: string; // Format: YYYY-MM-DD
    monthlyWage: number;
    jobPosition?: string; // Optional
    managerId?: string; // Optional
}

export const adminService = {
    /**
     * Get all employees (paginated)
     */
    getEmployees: async (page: number = 1, limit: number = 10, search?: string): Promise<PaginationResponse<Employee>> => {
        const response = await api.get<ApiResponse<{
            employees: Employee[];
            pagination: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        }>>(API_ENDPOINTS.ADMIN_EMPLOYEES, {
            params: { page, limit, search },
        });
        
        // Map backend response structure to frontend expected structure
        const backendData = response.data.data;
        if (!backendData) {
            return {
                items: [],
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 1,
            };
        }
        
        return {
            items: Array.isArray(backendData.employees) ? backendData.employees : [],
            total: backendData.pagination?.total || 0,
            page: backendData.pagination?.page || page,
            limit: backendData.pagination?.limit || limit,
            totalPages: backendData.pagination?.totalPages || 1,
        };
    },

    /**
     * Register new employee
     */
    createEmployee: async (data: EmployeeCreateData): Promise<Employee> => {
        const response = await api.post<ApiResponse<Employee>>(API_ENDPOINTS.REGISTER, data);
        return response.data.data!;
    },

    /**
     * Update employee information
     */
    updateEmployee: async (userId: string, data: Partial<EmployeeCreateData>): Promise<Employee> => {
        const response = await api.put<ApiResponse<Employee>>(API_ENDPOINTS.PROFILE(userId), data);
        return response.data.data!;
    },

    /**
     * Get single employee by ID
     */
    getEmployee: async (userId: string): Promise<Employee> => {
        const response = await api.get<ApiResponse<Employee>>(API_ENDPOINTS.PROFILE(userId));
        return response.data.data!;
    },

    /**
     * Delete employee
     */
    deleteEmployee: async (userId: string): Promise<void> => {
        await api.delete(API_ENDPOINTS.PROFILE(userId));
    },
};
