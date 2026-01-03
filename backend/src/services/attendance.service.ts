import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { AttendanceStatus, Role } from '../types';
import { calculateWorkHours, calculateExtraHours, formatDate, getMonthDateRange } from '../utils/helpers';

export class AttendanceService {
    /**
     * Check in
     */
    async checkIn(userId: string, location: { latitude: number; longitude: number }, deviceInfo?: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { employee: true },
        });

        if (!user || !user.employee) {
            throw new NotFoundError('Employee not found');
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already checked in today
        const existing = await prisma.attendance.findFirst({
            where: {
                employeeId: user.employee.id,
                date: { gte: today },
            },
        });

        if (existing && existing.checkIn) {
            throw new ValidationError('Already checked in today');
        }

        const attendance = await prisma.attendance.create({
            data: {
                employeeId: user.employee.id,
                date: new Date(),
                checkIn: new Date(),
                checkInLat: location.latitude,
                checkInLng: location.longitude,
                deviceInfo,
                status: AttendanceStatus.PRESENT,
            },
        });

        // Return the actual stored time (already in UTC from database)
        return {
            checkInTime: attendance.checkIn!.toISOString(),
            attendanceId: attendance.id,
        };
    }

    /**
     * Check out
     */
    async checkOut(userId: string, attendanceId: string, location: { latitude: number; longitude: number }) {
        const attendance = await prisma.attendance.findUnique({
            where: { id: attendanceId },
            include: { employee: { include: { user: true } } },
        });

        if (!attendance) {
            throw new NotFoundError('Attendance record not found');
        }

        if (attendance.employee.userId !== userId) {
            throw new ValidationError('Unauthorized');
        }

        if (!attendance.checkIn) {
            throw new ValidationError('No check-in record found');
        }

        if (attendance.checkOut) {
            throw new ValidationError('Already checked out');
        }

        const checkOut = new Date();
        const breakMinutes = 60; // Default 1 hour break
        const workHours = calculateWorkHours(attendance.checkIn, checkOut, breakMinutes);
        const extraHours = calculateExtraHours(workHours, attendance.employee.dailyHours);

        const updated = await prisma.attendance.update({
            where: { id: attendanceId },
            data: {
                checkOut,
                checkOutLat: location.latitude,
                checkOutLng: location.longitude,
                workHours,
                extraHours,
                breakTime: '01:00',
            },
        });

        return {
            checkOutTime: updated.checkOut!.toISOString(),
            workHours: updated.workHours,
            extraHours: updated.extraHours,
        };
    }

    /**
     * Get attendance records
     */
    async getAttendanceRecords(
        userId: string,
        role: Role,
        filters: {
            employeeId?: string;
            month?: string;
            year?: string;
            page?: number;
            limit?: number;
        }
    ) {
        const page = filters.page || 1;
        const limit = filters.limit || 30;
        const skip = (page - 1) * limit;

        if (role === Role.EMPLOYEE) {
            return this.getEmployeeAttendance(userId, filters.month, filters.year, page, limit, skip);
        } else {
            return this.getAdminAttendance(filters.employeeId, filters.month, filters.year, page, limit, skip);
        }
    }

    private async getEmployeeAttendance(
        userId: string,
        month?: string,
        year?: string,
        page: number = 1,
        limit: number = 30,
        skip: number = 0
    ) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { employee: true },
        });

        if (!user || !user.employee) {
            throw new NotFoundError('Employee not found');
        }

        const currentDate = new Date();
        const targetMonth = month ? parseInt(month.split('-')[1]) : currentDate.getMonth() + 1;
        const targetYear = year ? parseInt(year) : currentDate.getFullYear();

        const { start, end } = getMonthDateRange(targetYear, targetMonth);

        const records = await prisma.attendance.findMany({
            where: {
                employeeId: user.employee.id,
                date: { gte: start, lte: end },
            },
            orderBy: { date: 'desc' },
            skip,
            take: limit,
        });

        const total = await prisma.attendance.count({
            where: {
                employeeId: user.employee.id,
                date: { gte: start, lte: end },
            },
        });

        const daysPresent = records.filter(r => r.status === AttendanceStatus.PRESENT).length;
        const daysAbsent = records.filter(r => r.status === AttendanceStatus.ABSENT).length;
        const leavesTaken = records.filter(r => r.status === AttendanceStatus.ON_LEAVE).length;

        return {
            summary: {
                month: `${start.toLocaleString('default', { month: 'long' })} ${targetYear}`,
                totalWorkingDays: 22, // Simplified
                daysPresent,
                daysAbsent,
                leavesTaken,
                halfDays: 0,
            },
            records: records.map(r => ({
                id: r.id,
                date: formatDate(r.date),
                day: r.date.toLocaleDateString('en-US', { weekday: 'long' }),
                checkIn: r.checkIn ? r.checkIn.toISOString() : null,
                checkOut: r.checkOut ? r.checkOut.toISOString() : null,
                workHours: r.workHours,
                extraHours: r.extraHours,
                breakTime: r.breakTime,
                status: r.status,
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    private async getAdminAttendance(
        employeeId?: string,
        month?: string,
        year?: string,
        page: number = 1,
        limit: number = 30,
        skip: number = 0
    ) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const where: any = {
            date: { gte: today },
        };

        if (employeeId) {
            const employee = await prisma.employee.findFirst({
                where: { userId: employeeId },
            });
            if (employee) {
                where.employeeId = employee.id;
            }
        }

        const records = await prisma.attendance.findMany({
            where,
            include: {
                employee: {
                    include: { user: true },
                },
            },
            orderBy: { date: 'desc' },
            skip,
            take: limit,
        });

        const total = await prisma.attendance.count({ where });

        const present = records.filter(r => r.status === AttendanceStatus.PRESENT).length;
        const absent = records.filter(r => r.status === AttendanceStatus.ABSENT).length;
        const onLeave = records.filter(r => r.status === AttendanceStatus.ON_LEAVE).length;

        return {
            summary: {
                date: formatDate(today),
                totalEmployees: await prisma.employee.count({ where: { status: 'ACTIVE' } }),
                present,
                absent,
                onLeave,
            },
            records: records.map(r => ({
                employee: {
                    id: r.employee.userId,
                    name: `${r.employee.user.firstName} ${r.employee.user.lastName}`,
                    profilePic: r.employee.user.profilePicUrl,
                    department: r.employee.department,
                },
                checkIn: r.checkIn ? r.checkIn.toISOString() : null,
                checkOut: r.checkOut ? r.checkOut.toISOString() : null,
                workHours: r.workHours,
                extraHours: r.extraHours,
                status: r.status,
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
