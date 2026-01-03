import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { generateLoginId, generatePassword, generateOTP } from '../utils/helpers';
import { sendWelcomeEmail, sendOTPEmail } from '../utils/email';
import { UnauthorizedError, ConflictError, NotFoundError } from '../utils/errors';
import { JWTPayload, Role } from '../types';

export class AuthService {
    /**
     * Register new employee (Admin only)
     */
    async register(data: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        role: Role;
        company: string;
        department: string;
        managerId?: string;
        location: string;
        dateOfJoining: string;
        monthlyWage: number;
    }) {
        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new ConflictError('Email already registered');
        }

        // Generate login ID
        const year = new Date().getFullYear();
        const count = await prisma.user.count({
            where: {
                loginId: {
                    contains: year.toString(),
                },
            },
        });
        const serial = count + 1;
        const loginId = generateLoginId(data.firstName, data.lastName, year, serial);

        // Generate temporary password
        const tempPassword = generatePassword();
        const passwordHash = await bcrypt.hash(tempPassword, 10);

        // Generate employee code
        const employeeCount = await prisma.employee.count();
        const employeeCode = `EMP${(employeeCount + 1).toString().padStart(3, '0')}`;

        // Create user and employee in transaction
        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email: data.email,
                    loginId,
                    passwordHash,
                    role: data.role,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    isVerified: true,
                    isFirstLogin: true,
                },
            });

            await tx.employee.create({
                data: {
                    userId: newUser.id,
                    employeeCode,
                    company: data.company,
                    department: data.department,
                    managerId: data.managerId,
                    location: data.location,
                    dateOfJoining: new Date(data.dateOfJoining),
                    phone: data.phone,
                    monthlyWage: data.monthlyWage,
                },
            });

            return newUser;
        });

        // Send welcome email
        await sendWelcomeEmail(data.email, data.firstName, loginId, tempPassword);

        return {
            employeeId: employeeCode,
            loginId,
            tempPassword,
            email: data.email,
        };
    }

    /**
     * Login - Step 1: Verify credentials and send OTP
     */
    async login(email: string, password: string) {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid credentials');
        }

        // Generate OTP
        const otp = generateOTP();
        const otpHash = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRY_MINUTES || '5') * 60 * 1000);

        // Store OTP
        await prisma.oTP.create({
            data: {
                userId: user.id,
                otpHash,
                expiresAt,
            },
        });

        // Send OTP email
        await sendOTPEmail(email, otp, user.firstName);

        // Generate temporary token for OTP verification
        const tempToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_ACCESS_SECRET!,
            { expiresIn: '10m' }
        );

        return {
            requiresOTP: true,
            tempToken,
        };
    }

    /**
     * Login - Step 2: Verify OTP and issue tokens
     */
    async verifyOTP(userId: string, otp: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                employee: true,
            },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Find valid OTP
        const otpRecord = await prisma.oTP.findFirst({
            where: {
                userId,
                isUsed: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (!otpRecord) {
            throw new UnauthorizedError('Invalid or expired OTP');
        }

        const isOTPValid = await bcrypt.compare(otp, otpRecord.otpHash);
        if (!isOTPValid) {
            throw new UnauthorizedError('Invalid OTP');
        }

        // Mark OTP as used
        await prisma.oTP.update({
            where: { id: otpRecord.id },
            data: { isUsed: true },
        });

        // Generate tokens
        const accessToken = this.generateAccessToken(user as any);
        const refreshToken = await this.generateRefreshToken(user.id);

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                profilePic: user.profilePicUrl,
                loginId: user.loginId,
                isFirstLogin: user.isFirstLogin,
            },
        };
    }

    /**
     * Change password
     */
    async changePassword(userId: string, oldPassword: string, newPassword: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Current password is incorrect');
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash: newPasswordHash,
                isFirstLogin: false,
            },
        });
    }

    /**
     * Refresh access token
     */
    async refreshAccessToken(refreshToken: string) {
        const tokenRecord = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.expiresAt < new Date()) {
            throw new UnauthorizedError('Invalid or expired refresh token');
        }

        const accessToken = this.generateAccessToken(tokenRecord.user as any);

        return { accessToken };
    }

    /**
     * Generate access token
     */
    private generateAccessToken(user: { id: string; email: string; role: any }): string {
        const payload: JWTPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
            expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
        } as any);
    }

    /**
     * Generate refresh token
     */
    private async generateRefreshToken(userId: string): Promise<string> {
        const token = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
            expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
        } as any);

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await prisma.refreshToken.create({
            data: {
                userId,
                token,
                expiresAt,
            },
        });

        return token;
    }
}
