import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        firstName: z.string().min(2, 'First name must be at least 2 characters'),
        lastName: z.string().min(2, 'Last name must be at least 2 characters'),
        email: z.string().email('Invalid email format'),
        phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
        role: z.enum(['ADMIN', 'EMPLOYEE']).default('EMPLOYEE'),
        company: z.string().min(2, 'Company name is required'),
        department: z.string().min(2, 'Department is required'),
        managerId: z.string().optional(),
        location: z.string().min(2, 'Location is required'),
        dateOfJoining: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
        monthlyWage: z.number().positive('Monthly wage must be positive'),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email format'),
        password: z.string().min(1, 'Password is required'),
    }),
});

export const verifyOTPSchema = z.object({
    body: z.object({
        otp: z.string().length(6, 'OTP must be 6 digits'),
    }),
});

export const changePasswordSchema = z.object({
    body: z.object({
        oldPassword: z.string().min(1, 'Old password is required'),
        newPassword: z.string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number')
            .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
        confirmPassword: z.string(),
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    }),
});

export const refreshTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string().min(1, 'Refresh token is required'),
    }),
});
