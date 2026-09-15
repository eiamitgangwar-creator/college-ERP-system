import express from 'express';
import { submitGrade, getStudentGrades } from './grade.controller';
import { protect, authorizeRoles } from '../../middlewares/authMiddleware';

const router = express.Router();
router.post('/submit', protect as any, authorizeRoles('admin', 'teacher'), submitGrade);
router.get('/report/:studentId', protect as any, authorizeRoles('admin', 'teacher', 'student'), getStudentGrades);

export default router;
