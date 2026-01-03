// User and Authentication Types
export const Role = {
    ADMIN: 'ADMIN',
    EMPLOYEE: 'EMPLOYEE',
    admin: 'admin',
    employee: 'employee',
} as const;
export type Role = typeof Role[keyof typeof Role];

export const AttendanceStatus = {
    PRESENT: 'PRESENT',
    ABSENT: 'ABSENT',
    ON_LEAVE: 'ON_LEAVE',
    HALF_DAY: 'HALF_DAY',
} as const;
export type AttendanceStatus = typeof AttendanceStatus[keyof typeof AttendanceStatus];

export const LeaveType = {
    PAID: 'PAID',
    SICK: 'SICK',
    UNPAID: 'UNPAID',
} as const;
export type LeaveType = typeof LeaveType[keyof typeof LeaveType];

export const LeaveStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
} as const;
export type LeaveStatus = typeof LeaveStatus[keyof typeof LeaveStatus];

export const EmployeeStatus = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    TERMINATED: 'TERMINATED',
} as const;
export type EmployeeStatus = typeof EmployeeStatus[keyof typeof EmployeeStatus];

export interface User {
    id: string;
    email: string;
    loginId?: string;
    role: Role;
    firstName: string;
    lastName: string;
    profilePic?: string | null;
    isFirstLogin?: boolean;
    employeeId?: string;
    department?: string;
    position?: string;
    phone?: string;
    address?: string;
    joinDate?: string;
    isVerified?: boolean;
    password?: string; // Only for local mock usage
}

export interface Employee extends User {
    employeeCode?: string;
    jobPosition?: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface LoginResponse {
    requiresOTP: boolean;
    tempToken: string;
}

// Profile Types
export interface ProfileData {
    personal: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
        profilePic: string | null;
        dateOfBirth: string | null;
        gender: string | null;
        maritalStatus: string | null;
        nationality: string | null;
        address: string | null;
    };
    professional: {
        employeeCode: string | null;
        loginId: string;
        company: string | null;
        department: string | null;
        jobPosition: string | null;
        manager: string | null;
        location: string | null;
        dateOfJoining: string | null;
        workSchedule: {
            workingDays: number | null;
            dailyHours: number | null;
            breakTime: string | null;
        };
    };
    bank: {
        accountNumber: string | null;
        bankName: string | null;
        ifscCode: string | null;
        panNumber: string | null;
        uanNumber: string | null;
    };
}

// Dashboard Types
export interface DashboardData {
    summary?: {
        totalEmployees: number;
        presentToday: number;
        onLeave: number;
        pendingApprovals: number;
    };
    quickStats?: {
        attendanceToday: AttendanceStatus;
        leaveBalance: {
            paid: number;
            sick: number;
            unpaid: number;
        };
        upcomingLeaves: number;
    };
    employeeCards?: EmployeeCard[];
    recentActivity?: Activity[];
    notifications?: Notification[];
}

export interface EmployeeCard {
    id: string;
    name: string;
    profilePic: string | null;
    role: string | null;
    department: string | null;
    status: string;
    attendance: {
        checkIn: string | null;
        checkOut: string | null;
    };
}

export interface Activity {
    type: string;
    message: string;
    timestamp: string;
}

export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    timestamp: string;
    metadata?: any;
}

// Attendance Types
export interface AttendanceRecord {
    date: string;
    day: string;
    checkIn: string | null;
    checkOut: string | null;
    workHours: number | null;
    extraHours: number | null;
    breakTime: string | null;
    status: AttendanceStatus;
}

export interface AttendanceHistory {
    summary: {
        month: string;
        totalWorkingDays: number;
        daysPresent: number;
        daysAbsent: number;
        leavesTaken: number;
        halfDays: number;
    };
    records: AttendanceRecord[];
    pagination: PaginationData;
}

// Leave Types
export interface LeaveRequest {
    id: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    duration: number;
    reason: string;
    status: LeaveStatus;
    appliedOn: string;
    attachment: string | null;
    employee?: {
        id: string;
        name: string;
        department?: string;
        employeeCode?: string;
    };
    // Legacy fields for backward compatibility
    employeeName?: string;
    employeeCode?: string;
}

export interface LeaveBalance {
    paid: number;
    sick: number;
    unpaid: number;
}

// Payroll Types
export interface PayrollData {
    summary: {
        grossSalary: number;
        totalDeductions: number;
        netSalary: number;
    };
    salaryComponents: SalaryComponent[];
}

export interface SalaryInfo {
    basic: {
        monthlyWage: number;
        yearlyWage: number;
    };
    components: SalaryComponent[];
    deductions: SalaryComponent[];
    totals: {
        grossSalary: number;
        totalDeductions: number;
        netSalary: number;
        employerPF: number;
        employerContribution: number;
    };
    workingSchedule?: {
        workingDaysPerWeek: number;
        workingHoursPerDay: number;
        breakTime: string;
    };
}

export interface SalaryComponent {
    name: string;
    type: string;
    percentage?: number;
    amount: number;
    formula?: string;
}

export interface Payslip {
    employee: {
        name: string;
        employeeCode: string;
        department: string;
    };
    period: {
        month: string;
        year: number;
        paymentDate: string;
    };
    attendance: {
        totalDays: number;
        presentDays: number;
        leaves: number;
        payableDays: number;
    };
    earnings: PayslipComponent[];
    deductions: PayslipComponent[];
    summary: {
        grossEarnings: number;
        totalDeductions: number;
        netPayable: number;
        proRatedAmount: number;
        inWords: string;
    };
    pdfUrl: string | null;
}

export interface PayslipComponent {
    component: string;
    amount: number;
    payableAmount: number;
}

// Common Types
export interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaginationResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}

export interface LocationData {
    latitude: number;
    longitude: number;
}
