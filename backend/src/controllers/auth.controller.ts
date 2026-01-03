import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../types';
import jwt from 'jsonwebtoken';

const authService = new AuthService();

export class AuthController {
    /**
     * Register new employee (Admin only)
     */
    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await authService.register(req.body);

            const response: ApiResponse = {
                success: true,
                message: 'Employee created successfully',
                data: result,
            };

            res.status(201).json(response);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Login - Step 1
     */
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);

            const response: ApiResponse = {
                success: true,
                message: 'OTP sent to registered email',
                data: result,
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Verify OTP - Step 2
     */
    async verifyOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'No token provided',
                    },
                });
                return;
            }

            const tempToken = authHeader.substring(7);
            const decoded = jwt.verify(tempToken, process.env.JWT_ACCESS_SECRET!) as { userId: string };

            const { otp } = req.body;
            const result = await authService.verifyOTP(decoded.userId, otp);

            const response: ApiResponse = {
                success: true,
                message: 'Login successful',
                data: result,
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Change password
     */
    async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { oldPassword, newPassword } = req.body;
            await authService.changePassword(req.user!.userId, oldPassword, newPassword);

            const response: ApiResponse = {
                success: true,
                message: 'Password changed successfully',
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Refresh token
     */
    async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { refreshToken } = req.body;
            const result = await authService.refreshAccessToken(refreshToken);

            const response: ApiResponse = {
                success: true,
                data: result,
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
}
