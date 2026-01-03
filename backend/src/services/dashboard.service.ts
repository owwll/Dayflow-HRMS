import prisma from '../config/database';
import { Role, AttendanceStatus, LeaveStatus } from '../types';
import { formatDate } from '../utils/helpers';

export class DashboardService {
    /**
     * Get dashboard data based on user role
     */
    async getDashboardData(userId: string, role: Role) {
        if (role === Role.EMPLOYEE) {
            return this.getEmployeeDashboard(userId);
        } else {
            return this.getAdminDashboard();
        }
    }

    /**
     * Employee dashboard
     */
    private async getEmployeeDashboard(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { employee: true },
        });

        if (!user || !user.employee) {
            throw new Error('Employee not found');
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get today's attendance
        const todayAttendance = await prisma.attendance.findFirst({
            where: {
                employeeId: user.employee.id,
                date: {
                    gte: today,
                },
            },
        });

        // Get leave balance (simplified - would need proper calculation)
        const leaveRequests = await prisma.leaveRequest.findMany({
            where: {
                employeeId: user.employee.id,
                status: LeaveStatus.APPROVED,
            },
        });

        const paidLeaves = leaveRequests.filter(l => l.leaveType === 'PAID').reduce((sum, l) => sum + l.duration, 0);
        const sickLeaves = leaveRequests.filter(l => l.leaveType === 'SICK').reduce((sum, l) => sum + l.duration, 0);

        // Get upcoming leaves
        const upcomingLeaves = await prisma.leaveRequest.findMany({
            where: {
                employeeId: user.employee.id,
                status: LeaveStatus.APPROVED,
                startDate: {
                    gte: new Date(),
                },
            },
            orderBy: { startDate: 'asc' },
            take: 5,
        });

        // Get recent activity
        const recentLeaves = await prisma.leaveRequest.findMany({
            where: { employeeId: user.employee.id },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        // Get notifications
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        return {
            quickStats: {
                attendanceToday: todayAttendance?.status || 'absent',
                checkInTime: todayAttendance?.checkIn ? todayAttendance.checkIn.toISOString() : null,
                checkOutTime: todayAttendance?.checkOut ? todayAttendance.checkOut.toISOString() : null,
                leaveBalance: {
                    paid: Math.max(0, 15 - paidLeaves),
                    sick: Math.max(0, 7 - sickLeaves),
                    unpaid: 0,
                },
                upcomingLeaves: upcomingLeaves.map(l => ({
                    type: l.leaveType,
                    startDate: formatDate(l.startDate),
                    endDate: formatDate(l.endDate),
                })),
            },
            recentActivity: recentLeaves.map(l => ({
                id: l.id,
                type: 'leave_applied',
                message: `Applied for ${l.leaveType.toLowerCase()} leave on ${formatDate(l.startDate)}`,
                timestamp: l.createdAt.toISOString(),
            })),
            notifications: notifications.map(n => ({
                id: n.id,
                type: n.type,
                message: n.message,
                read: n.read,
                timestamp: n.createdAt.toISOString(),
            })),
        };
    }

    /**
     * Admin dashboard
     */
    private async getAdminDashboard() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get total employees
        const totalEmployees = await prisma.employee.count({
            where: { status: 'ACTIVE' },
        });

        // Get today's attendance
        const todayAttendances = await prisma.attendance.findMany({
            where: {
                date: {
                    gte: today,
                },
            },
        });

        const presentToday = todayAttendances.filter(a => a.status === AttendanceStatus.PRESENT).length;

        // Get employees on leave today
        const onLeaveToday = await prisma.leaveRequest.count({
            where: {
                status: LeaveStatus.APPROVED,
                startDate: { lte: today },
                endDate: { gte: today },
            },
        });

        // Get pending approvals
        const pendingLeaves = await prisma.leaveRequest.count({
            where: { status: LeaveStatus.PENDING },
        });

        // Get employee cards
        const employees = await prisma.employee.findMany({
            where: { status: 'ACTIVE' },
            include: {
                user: true,
            },
            take: 50,
        });

        const employeeCards = await Promise.all(
            employees.map(async (emp) => {
                const attendance = await prisma.attendance.findFirst({
                    where: {
                        employeeId: emp.id,
                        date: { gte: today },
                    },
                });

                return {
                    id: emp.userId,
                    name: `${emp.user.firstName} ${emp.user.lastName}`,
                    profilePic: emp.user.profilePicUrl,
                    role: emp.jobPosition,
                    department: emp.department,
                    status: attendance?.status || 'absent',
                    attendance: {
                        checkIn: attendance?.checkIn ? attendance.checkIn.toISOString() : null,
                        checkOut: attendance?.checkOut ? attendance.checkOut.toISOString() : null,
                    },
                };
            })
        );

        return {
            summary: {
                totalEmployees,
                presentToday,
                onLeave: onLeaveToday,
                pendingApprovals: pendingLeaves,
            },
            employeeCards,
            pendingActions: [
                {
                    type: 'leave_approval',
                    count: pendingLeaves,
                    items: [],
                },
                {
                    type: 'attendance_regularization',
                    count: 0,
                    items: [],
                },
            ],
        };
    }
}
