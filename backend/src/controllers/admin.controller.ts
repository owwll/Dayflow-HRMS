import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { ApiResponse } from '../types';

const adminService = new AdminService();

export class AdminController {
    async getAllEmployees(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { department, status, search, page, limit } = req.query;

            const result = await adminService.getAllEmployees({
                department: department as string,
                status: status as string,
                search: search as string,
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
            });

            const response: ApiResponse = {
                success: true,
                data: result,
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async updateEmployeeStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { employeeId } = req.params;
            const { status, reason } = req.body;

            const result = await adminService.updateEmployeeStatus(employeeId, status, reason);

            const response: ApiResponse = {
                success: true,
                message: result.message,
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
}
