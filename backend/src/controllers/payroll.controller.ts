import { Request, Response, NextFunction } from 'express';
import { PayrollService } from '../services/payroll.service';
import { ApiResponse } from '../types';

const payrollService = new PayrollService();

export class PayrollController {
    async getSalaryInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { employeeId } = req.params;
            const result = await payrollService.getSalaryInfo(employeeId, req.user!.userId, req.user!.role);

            const response: ApiResponse = {
                success: true,
                data: result,
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async updateSalaryStructure(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { employeeId } = req.params;
            const { monthlyWage } = req.body;

            const result = await payrollService.updateSalaryStructure(employeeId, monthlyWage);

            const response: ApiResponse = {
                success: true,
                message: 'Salary structure updated',
                data: result,
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async generatePayslip(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { employeeId } = req.params;
            const { month, year } = req.query;

            if (!month || !year) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Month and year are required',
                    },
                });
                return;
            }

            const result = await payrollService.generatePayslip(employeeId, month as string, year as string);

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
