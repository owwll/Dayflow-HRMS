import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();
const adminController = new AdminController();

router.get('/employees', authenticate, requireAdmin, adminController.getAllEmployees.bind(adminController));
router.put('/employees/:employeeId/status', authenticate, requireAdmin, adminController.updateEmployeeStatus.bind(adminController));

export default router;
