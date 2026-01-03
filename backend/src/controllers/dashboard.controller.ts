import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { ApiResponse } from '../types';

const dashboardService = new DashboardService();

export class DashboardController {
    async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await dashboardService.getDashboardData(
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
}
