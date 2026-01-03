import prisma from '../config/database';
import { EmployeeStatus } from '../types';

export class AdminService {
    /**
     * Get all employees
     */
    async getAllEmployees(filters: {
        department?: string;
        status?: string;
        search?: string;
        page?: number;
        limit?: number;
    }) {
        const page = filters.page || 1;
        const limit = filters.limit || 50;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (filters.department) {
            where.department = filters.department;
        }

        if (filters.status) {
            where.status = filters.status.toUpperCase();
        }

        if (filters.search) {
            where.OR = [
                { user: { firstName: { contains: filters.search, mode: 'insensitive' } } },
                { user: { lastName: { contains: filters.search, mode: 'insensitive' } } },
                { user: { email: { contains: filters.search, mode: 'insensitive' } } },
                { employeeCode: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        const employees = await prisma.employee.findMany({
            where,
            include: {
                user: true,
            },
            skip,
            take: limit,
            orderBy: { id: 'desc' },
        });

        const total = await prisma.employee.count({ where });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const employeeData = await Promise.all(
            employees.map(async (emp: any) => {
                const attendance = await prisma.attendance.findFirst({
                    where: {
                        employeeId: emp.id,
                        date: { gte: today },
                    },
                });

                return {
                    id: emp.userId,
                    employeeCode: emp.employeeCode,
                    name: `${emp.user.firstName} ${emp.user.lastName}`,
                    email: emp.user.email,
                    profilePic: emp.user.profilePicUrl,
                    department: emp.department,
                    jobPosition: emp.jobPosition,
                    location: emp.location,
                    status: emp.status,
                    attendanceToday: {
                        status: attendance?.status || 'absent',
                        checkIn: attendance?.checkIn ? attendance.checkIn.toISOString().substring(11, 16) : null,
                        checkOut: attendance?.checkOut ? attendance.checkOut.toISOString().substring(11, 16) : null,
                    },
                };
            })
        );

        // Get summary
        const active = await prisma.employee.count({ where: { status: EmployeeStatus.ACTIVE } });
        const onLeave = await prisma.leaveRequest.count({
            where: {
                status: 'APPROVED',
                startDate: { lte: today },
                endDate: { gte: today },
            },
        });

        const departments = await prisma.employee.groupBy({
            by: ['department'],
            _count: true,
            where: { status: EmployeeStatus.ACTIVE },
        });

        return {
            employees: employeeData,
            summary: {
                total,
                active,
                onLeave,
                departments: departments.map(d => ({
                    name: d.department,
                    count: d._count,
                })),
            },
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Update employee status
     */
    async updateEmployeeStatus(employeeId: string, status: EmployeeStatus, _reason?: string) {
        const employee = await prisma.employee.findFirst({
            where: { userId: employeeId },
        });

        if (!employee) {
            throw new Error('Employee not found');
        }

        await prisma.employee.update({
            where: { id: employee.id },
            data: { status },
        });

        return {
            message: `Employee status updated to ${status.toLowerCase()}`,
        };
    }
}
