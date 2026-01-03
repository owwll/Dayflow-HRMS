import { Router } from 'express';
import { PayrollController } from '../controllers/payroll.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();
const payrollController = new PayrollController();

router.get('/:employeeId', authenticate, payrollController.getSalaryInfo.bind(payrollController));
router.put('/:employeeId/structure', authenticate, requireAdmin, payrollController.updateSalaryStructure.bind(payrollController));
router.post('/:employeeId/payslip', authenticate, payrollController.generatePayslip.bind(payrollController));

export default router;
