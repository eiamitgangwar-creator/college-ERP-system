

import express from 'express';
import { markAttendance, getStudentAttendance } from './attendance.controller';
import { protect, authorizeRoles } from '../../middlewares/authMiddleware';

const router = express.Router();

router.get('/test', (req, res) => {
    res.send("Attendance Route is Working!");
});
// POST: /api/attendance/mark 
router.post('/mark', protect as any, authorizeRoles('admin', 'teacher'), markAttendance);

// GET: /api/attendance/report/:studentId 
router.get('/report/:studentId', protect as any, authorizeRoles('admin', 'teacher', 'student'), getStudentAttendance);

export default router;
