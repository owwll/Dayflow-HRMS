import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const attendanceController = new AttendanceController();

router.post('/check-in', authenticate, attendanceController.checkIn.bind(attendanceController));
router.post('/check-out', authenticate, attendanceController.checkOut.bind(attendanceController));
router.get('/', authenticate, attendanceController.getAttendance.bind(attendanceController));

export default router;
