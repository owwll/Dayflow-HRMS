export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Dayflow HRMS';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// Local Storage Keys
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'dayflow_access_token',
    REFRESH_TOKEN: 'dayflow_refresh_token',
    USER_DATA: 'dayflow_user_data',
    TEMP_TOKEN: 'dayflow_temp_token',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login',
    VERIFY_OTP: '/auth/verify-otp',
    CHANGE_PASSWORD: '/auth/change-password',
    REFRESH_TOKEN: '/auth/refresh-token',
    REGISTER: '/auth/register',

    // Profile
    PROFILE: (userId: string) => `/profile/${userId}`,
    UPLOAD_PROFILE_PIC: (userId: string) => `/profile/${userId}/upload-picture`,

    // Dashboard
    DASHBOARD: '/dashboard',

    // Attendance
    CHECK_IN: '/attendance/check-in',
    CHECK_OUT: '/attendance/check-out',
    ATTENDANCE: '/attendance',

    // Leave
    APPLY_LEAVE: '/leave/apply',
    LEAVE_REQUESTS: '/leave',
    APPROVE_LEAVE: (leaveId: string) => `/leave/${leaveId}/approve`,

    // Payroll
    PAYROLL: '/payroll',
    PAYSLIP: (month: string) => `/payroll/payslip/${month}`,
    SALARY_INFO: (employeeId: string) => `/payroll/${employeeId}`,
    UPDATE_SALARY: (employeeId: string) => `/payroll/${employeeId}/structure`,
    GENERATE_PAYSLIP: (employeeId: string) => `/payroll/${employeeId}/payslip`,

    // Admin
    ADMIN_EMPLOYEES: '/admin/employees',
    ALL_EMPLOYEES: '/admin/employees',
    UPDATE_EMPLOYEE_STATUS: (employeeId: string) => `/admin/employees/${employeeId}/status`,

    // Notifications
    NOTIFICATIONS: '/notifications',
    MARK_READ: (notificationId: string) => `/notifications/${notificationId}/read`,
} as const;

// Route Paths
export const ROUTES = {
    LOGIN: '/login',
    CHANGE_PASSWORD: '/change-password',
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    ATTENDANCE: '/attendance',
    LEAVE: '/leave',
    LEAVE_APPLY: '/leave/apply',
    PAYROLL: '/payroll',
    PAYSLIP: '/payslip',
    ADMIN_EMPLOYEES: '/admin/employees',
    ADMIN_CREATE_EMPLOYEE: '/admin/employees/create',
} as const;

// Date Formats
export const DATE_FORMATS = {
    DISPLAY: 'dd MMM yyyy',
    API: 'yyyy-MM-dd',
    DATETIME: 'dd MMM yyyy HH:mm',
    TIME: 'HH:mm',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 30;
export const DEFAULT_PAGE = 1;

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', ...ALLOWED_IMAGE_TYPES];
