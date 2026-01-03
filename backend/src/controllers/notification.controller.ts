import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiResponse } from '../types';

export class NotificationController {
    async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { unreadOnly, type, page = 1, limit = 20 } = req.query;
            const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

            const where: any = { userId: req.user!.userId };

            if (unreadOnly === 'true') {
                where.read = false;
            }

            if (type) {
                where.type = type;
            }

            const notifications = await prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit as string),
            });

            const unreadCount = await prisma.notification.count({
                where: { userId: req.user!.userId, read: false },
            });

            const response: ApiResponse = {
                success: true,
                data: {
                    notifications: notifications.map(n => ({
                        id: n.id,
                        type: n.type,
                        title: n.title,
                        message: n.message,
                        read: n.read,
                        timestamp: n.createdAt.toISOString(),
                        metadata: n.metadata,
                    })),
                    unreadCount,
                },
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { notificationId } = req.params;

            await prisma.notification.update({
                where: { id: notificationId },
                data: { read: true },
            });

            const response: ApiResponse = {
                success: true,
                message: 'Notification marked as read',
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
}
