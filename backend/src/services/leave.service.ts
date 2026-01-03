import prisma from '../config/database';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors';
import { LeaveType, LeaveStatus, Role, NotificationType } from '../types';
import { calculateDaysBetween, formatDate } from '../utils/helpers';
import { sendLeaveStatusEmail } from '../utils/email';
import cloudinary from '../config/cloudinary';

export class LeaveService {
    /**
     * Apply for leave
     */
    async applyLeave(
        userId: string,
        data: {
            leaveType: LeaveType;
            startDate: string;
            endDate: string;
            reason: string;
            attachment?: Express.Multer.File;
        }
    ) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { employee: true },
        });

        if (!user || !user.employee) {
            throw new NotFoundError('Employee not found');
        }

        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        const duration = calculateDaysBetween(startDate, endDate);

        let attachmentUrl: string | undefined;

        if (data.attachment) {
            const result = await cloudinary.uploader.upload(
                `data:${data.attachment.mimetype};base64,${data.attachment.buffer.toString('base64')}`,
                {
                    folder: 'hrms/leave-attachments',
                }
            );
            attachmentUrl = result.secure_url;
        }

        const leaveRequest = await prisma.leaveRequest.create({
            data: {
                employeeId: user.employee.id,
                leaveType: data.leaveType,
                startDate,
                endDate,
                duration,
                reason: data.reason,
                attachment: attachmentUrl,
                status: LeaveStatus.PENDING,
            },
        });

        // Create notification for admin
        const admins = await prisma.user.findMany({
            where: { role: Role.ADMIN },
        });

        await Promise.all(
            admins.map(admin =>
                prisma.notification.create({
                    data: {
                        userId: admin.id,
                        type: NotificationType.LEAVE_APPLIED,
                        title: 'New Leave Request',
                        message: `${user.firstName} ${user.lastName} applied for ${data.leaveType.toLowerCase()} leave`,
                        metadata: { leaveId: leaveRequest.id },
                    },
                })
            )
        );

        return {
            leaveId: leaveRequest.id,
            status: leaveRequest.status,
        };
    }

    /**
     * Get leave requests
     */
    async getLeaveRequests(
        userId: string,
        role: Role,
        filters: {
            status?: string;
            employeeId?: string;
            startDate?: string;
            endDate?: string;
            page?: number;
            limit?: number;
        }
    ) {
        const page = filters.page || 1;
        const limit = filters.limit || 30;
        const skip = (page - 1) * limit;

        if (role === Role.EMPLOYEE) {
            return this.getEmployeeLeaves(userId, filters.status, page, limit, skip);
        } else {
            return this.getAdminLeaves(filters, page, limit, skip);
        }
    }

    private async getEmployeeLeaves(
        userId: string,
        status?: string,
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

        const where: any = { employeeId: user.employee.id };
        if (status) {
            where.status = status.toUpperCase();
        }

        const requests = await prisma.leaveRequest.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });

        // Calculate leave balance
        const approvedLeaves = await prisma.leaveRequest.findMany({
            where: {
                employeeId: user.employee.id,
                status: LeaveStatus.APPROVED,
            },
        });

        const paidLeaves = approvedLeaves.filter(l => l.leaveType === LeaveType.PAID).reduce((sum, l) => sum + l.duration, 0);
        const sickLeaves = approvedLeaves.filter(l => l.leaveType === LeaveType.SICK).reduce((sum, l) => sum + l.duration, 0);

        return {
            balance: {
                paid: Math.max(0, 15 - paidLeaves),
                sick: Math.max(0, 7 - sickLeaves),
                unpaid: 0,
            },
            requests: requests.map(r => ({
                id: r.id,
                leaveType: r.leaveType,
                startDate: formatDate(r.startDate),
                endDate: formatDate(r.endDate),
                duration: r.duration,
                reason: r.reason,
                status: r.status,
                appliedOn: r.createdAt.toISOString(),
                attachment: r.attachment,
            })),
        };
    }

    private async getAdminLeaves(
        filters: any,
        page: number,
        limit: number,
        skip: number
    ) {
        const where: any = {};

        if (filters.status) {
            where.status = filters.status.toUpperCase();
        }

        if (filters.employeeId) {
            const employee = await prisma.employee.findFirst({
                where: { userId: filters.employeeId },
            });
            if (employee) {
                where.employeeId = employee.id;
            }
        }

        const requests = await prisma.leaveRequest.findMany({
            where,
            include: {
                employee: {
                    include: { user: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });

        const total = await prisma.leaveRequest.count({ where });

        const pending = await prisma.leaveRequest.count({ where: { status: LeaveStatus.PENDING } });
        const approved = await prisma.leaveRequest.count({ where: { status: LeaveStatus.APPROVED } });
        const rejected = await prisma.leaveRequest.count({ where: { status: LeaveStatus.REJECTED } });

        return {
            summary: {
                pending,
                approved,
                rejected,
            },
            requests: requests.map(r => ({
                id: r.id,
                employee: {
                    id: r.employee.userId,
                    name: `${r.employee.user.firstName} ${r.employee.user.lastName}`,
                    department: r.employee.department,
                    employeeCode: r.employee.employeeCode,
                },
                leaveType: r.leaveType,
                startDate: formatDate(r.startDate),
                endDate: formatDate(r.endDate),
                duration: r.duration,
                reason: r.reason,
                status: r.status,
                appliedOn: r.createdAt.toISOString(),
                attachment: r.attachment,
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Approve or reject leave
     */
    async updateLeaveStatus(
        leaveId: string,
        action: 'approve' | 'reject',
        adminId: string,
        comments?: string
    ) {
        const leaveRequest = await prisma.leaveRequest.findUnique({
            where: { id: leaveId },
            include: {
                employee: {
                    include: { user: true },
                },
            },
        });

        if (!leaveRequest) {
            throw new NotFoundError('Leave request not found');
        }

        const status = action === 'approve' ? LeaveStatus.APPROVED : LeaveStatus.REJECTED;

        const updated = await prisma.leaveRequest.update({
            where: { id: leaveId },
            data: {
                status,
                approvedBy: adminId,
                approvedAt: new Date(),
                comments,
            },
        });

        // Create notification for employee
        await prisma.notification.create({
            data: {
                userId: leaveRequest.employee.userId,
                type: action === 'approve' ? NotificationType.LEAVE_APPROVED : NotificationType.LEAVE_REJECTED,
                title: `Leave Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
                message: `Your ${leaveRequest.leaveType.toLowerCase()} leave request has been ${action}d`,
                metadata: { leaveId: leaveRequest.id },
            },
        });

        // Send email
        await sendLeaveStatusEmail(
            leaveRequest.employee.user.email,
            leaveRequest.employee.user.firstName,
            action === 'approve' ? 'approved' : 'rejected',
            leaveRequest.leaveType,
            formatDate(leaveRequest.startDate),
            formatDate(leaveRequest.endDate),
            comments
        );

        return {
            leaveId: updated.id,
            status: updated.status,
            updatedBy: adminId,
            updatedAt: updated.approvedAt!.toISOString(),
        };
    }
}
