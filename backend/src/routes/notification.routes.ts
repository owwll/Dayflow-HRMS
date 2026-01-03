import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const notificationController = new NotificationController();

router.get('/', authenticate, notificationController.getNotifications.bind(notificationController));
router.put('/:notificationId/read', authenticate, notificationController.markAsRead.bind(notificationController));

export default router;
