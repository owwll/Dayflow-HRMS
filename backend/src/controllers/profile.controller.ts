import { Request, Response, NextFunction } from 'express';
import { ProfileService } from '../services/profile.service';
import { ApiResponse } from '../types';

const profileService = new ProfileService();

export class ProfileController {
    async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.params;
            const result = await profileService.getProfile(
                userId,
                req.user!.userId,
                req.user!.role
            );

            const response: ApiResponse = {
                success: true,
                data: result,
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.params;
            await profileService.updateProfile(
                userId,
                req.user!.userId,
                req.user!.role,
                req.body
            );

            const response: ApiResponse = {
                success: true,
                message: 'Profile updated successfully',
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async uploadProfilePicture(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.params;

            if (!req.file) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'No file uploaded',
                    },
                });
                return;
            }

            const result = await profileService.uploadProfilePicture(userId, req.file);

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
