import { Request, Response, NextFunction } from 'express';
import { AttendanceService } from '../services/attendance.service';
import { ApiResponse } from '../types';

const attendanceService = new AttendanceService();

export class AttendanceController {
    async checkIn(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { location, deviceInfo } = req.body;
            const result = await attendanceService.checkIn(req.user!.userId, location, deviceInfo);

            const response: ApiResponse = {
                success: true,
                message: 'Checked in successfully',
                data: result,
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async checkOut(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { attendanceId, location } = req.body;
            // attendanceId is optional - if not provided, service will find today's record
            const result = await attendanceService.checkOut(req.user!.userId, attendanceId || null, location);

            const response: ApiResponse = {
                success: true,
                message: 'Checked out successfully',
                data: result,
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async getAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { employeeId, month, year, page, limit } = req.query;

            const result = await attendanceService.getAttendanceRecords(
                req.user!.userId,
                req.user!.role,
                {
                    employeeId: employeeId as string,
                    month: month as string,
                    year: year as string,
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
}
