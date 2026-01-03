import { Request, Response, NextFunction } from 'express';
import { LeaveService } from '../services/leave.service';
import { ApiResponse } from '../types';

const leaveService = new LeaveService();

export class LeaveController {
    async applyLeave(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await leaveService.applyLeave(req.user!.userId, {
                ...req.body,
                attachment: req.file,
            });

            const response: ApiResponse = {
                success: true,
                message: 'Leave request submitted',
                data: result,
            };

            res.status(201).json(response);
        } catch (error) {
            next(error);
        }
    }

    async getLeaveRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { status, employeeId, startDate, endDate, page, limit } = req.query;

            const result = await leaveService.getLeaveRequests(
                req.user!.userId,
                req.user!.role,
                {
                    status: status as string,
                    employeeId: employeeId as string,
                    startDate: startDate as string,
                    endDate: endDate as string,
                    page: page ? parseInt(page as string) : undefined,
                    limit: limit ? parseInt(limit as string) : undefined,
                }
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

    async updateLeaveStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { leaveId } = req.params;
            const { action, comments } = req.body;

            const result = await leaveService.updateLeaveStatus(
                leaveId,
                action,
                req.user!.userId,
                comments
            );

            const response: ApiResponse = {
                success: true,
                message: `Leave request ${action}d`,
                data: result,
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
}
