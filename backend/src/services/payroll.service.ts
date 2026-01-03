import prisma from '../config/database';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { Role } from '../types';
import { getMonthYear, calculateProRatedAmount, numberToWords, getMonthDateRange } from '../utils/helpers';

export class PayrollService {
    /**
     * Get salary information
     */
    async getSalaryInfo(employeeId: string, requestingUserId: string, requestingUserRole: Role) {
        const employee = await prisma.employee.findFirst({
            where: { userId: employeeId },
            include: { user: true },
        });

        if (!employee) {
            throw new NotFoundError('Employee not found');
        }

        // Check permissions
        if (requestingUserRole === Role.EMPLOYEE && employeeId !== requestingUserId) {
            throw new ForbiddenError('You can only view your own salary information');
        }

        const monthlyWage = employee.monthlyWage;

        // Calculate components
        const basicSalary = monthlyWage * 0.5;
        const hra = basicSalary * 0.5;
        const standardAllowance = 4167;
        const pfEmployee = basicSalary * 0.12;
        const pfEmployer = basicSalary * 0.12;
        const professionalTax = 200;

        const grossSalary = monthlyWage;
        const totalDeductions = pfEmployee + professionalTax;
        const netSalary = grossSalary - totalDeductions;

        return {
            basic: {
                monthlyWage,
                yearlyWage: monthlyWage * 12,
            },
            components: [
                {
                    name: 'Basic Salary',
                    type: 'percentage',
                    percentage: 50,
                    amount: basicSalary,
                    formula: '50% of monthly wage',
                },
                {
                    name: 'House Rent Allowance',
                    type: 'percentage_of_basic',
                    percentage: 50,
                    amount: hra,
                    formula: '50% of basic salary',
                },
                {
                    name: 'Standard Allowance',
                    type: 'fixed',
                    amount: standardAllowance,
                },
            ],
            deductions: [
                {
                    name: 'Provident Fund (Employee)',
                    type: 'percentage',
                    percentage: 12,
                    amount: pfEmployee,
                    formula: '12% of basic salary',
                },
                {
                    name: 'Professional Tax',
                    type: 'fixed',
                    amount: professionalTax,
                },
            ],
            totals: {
                grossSalary,
                totalDeductions,
                netSalary,
                employerPF: pfEmployer,
                employerContribution: pfEmployer,
            },
            workingSchedule: {
                workingDaysPerWeek: employee.workingDays,
                workingHoursPerDay: employee.dailyHours,
                breakTime: employee.breakTime,
            },
        };
    }

    /**
     * Update salary structure (Admin only)
     */
    async updateSalaryStructure(employeeId: string, monthlyWage: number) {
        const employee = await prisma.employee.findFirst({
            where: { userId: employeeId },
        });

        if (!employee) {
            throw new NotFoundError('Employee not found');
        }

        await prisma.employee.update({
            where: { id: employee.id },
            data: { monthlyWage },
        });

        // Recalculate
        const basicSalary = monthlyWage * 0.5;
        const pfEmployee = basicSalary * 0.12;
        const professionalTax = 200;
        const netSalary = monthlyWage - pfEmployee - professionalTax;

        return {
            recalculated: true,
            newMonthlyWage: monthlyWage,
            netSalary,
        };
    }

    /**
     * Generate payslip
     */
    async generatePayslip(employeeId: string, month: string, year: string) {
        const employee = await prisma.employee.findFirst({
            where: { userId: employeeId },
            include: { user: true },
        });

        if (!employee) {
            throw new NotFoundError('Employee not found');
        }

        const targetMonth = parseInt(month);
        const targetYear = parseInt(year);
        const { start, end } = getMonthDateRange(targetYear, targetMonth);

        // Get attendance for the month
        const attendances = await prisma.attendance.findMany({
            where: {
                employeeId: employee.id,
                date: { gte: start, lte: end },
            },
        });

        const totalDays = 22; // Simplified
        const presentDays = attendances.filter(a => a.status === 'PRESENT').length;
        const leaves = attendances.filter(a => a.status === 'ON_LEAVE').length;
        const payableDays = presentDays + leaves;

        const monthlyWage = employee.monthlyWage;
        const basicSalary = monthlyWage * 0.5;
        const hra = basicSalary * 0.5;
        const pfEmployee = basicSalary * 0.12;
        const professionalTax = 200;

        const grossEarnings = monthlyWage;
        const totalDeductions = pfEmployee + professionalTax;
        const netPayable = grossEarnings - totalDeductions;
        const proRatedAmount = calculateProRatedAmount(netPayable, totalDays, payableDays);

        return {
            employee: {
                name: `${employee.user.firstName} ${employee.user.lastName}`,
                employeeCode: employee.employeeCode,
                department: employee.department,
            },
            period: {
                month: start.toLocaleString('default', { month: 'long' }),
                year: targetYear,
                paymentDate: new Date(targetYear, targetMonth, 5).toISOString().split('T')[0],
            },
            attendance: {
                totalDays,
                presentDays,
                leaves,
                payableDays,
            },
            earnings: [
                {
                    component: 'Basic Salary',
                    amount: basicSalary,
                    payableAmount: calculateProRatedAmount(basicSalary, totalDays, payableDays),
                },
                {
                    component: 'House Rent Allowance',
                    amount: hra,
                    payableAmount: calculateProRatedAmount(hra, totalDays, payableDays),
                },
            ],
            deductions: [
                {
                    component: 'Provident Fund',
                    amount: pfEmployee,
                    payableAmount: calculateProRatedAmount(pfEmployee, totalDays, payableDays),
                },
                {
                    component: 'Professional Tax',
                    amount: professionalTax,
                    payableAmount: calculateProRatedAmount(professionalTax, totalDays, payableDays),
                },
            ],
            summary: {
                grossEarnings,
                totalDeductions,
                netPayable,
                proRatedAmount,
                inWords: numberToWords(Math.round(proRatedAmount)),
            },
            pdfUrl: null, // Would generate PDF here
        };
    }
}
