import { Router } from 'express';
import { LeaveController } from '../controllers/leave.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();
const leaveController = new LeaveController();

router.post('/apply', authenticate, upload.single('attachment'), leaveController.applyLeave.bind(leaveController));
router.get('/', authenticate, leaveController.getLeaveRequests.bind(leaveController));
router.put('/:leaveId/approve', authenticate, requireAdmin, leaveController.updateLeaveStatus.bind(leaveController));

export default router;
