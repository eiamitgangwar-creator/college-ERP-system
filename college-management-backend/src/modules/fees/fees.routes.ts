import express from 'express';
import { submitFees, getFeesStatus } from './fees.controller';
import { protect, authorizeRoles } from '../../middlewares/authMiddleware';

const router = express.Router();

// submit fee only by admin
router.post('/submit', protect as any, authorizeRoles('admin'), submitFees);

// see fee status-> Admin, Teacher, Student 
router.get('/status/:studentId', protect as any, authorizeRoles('admin', 'teacher', 'student'), getFeesStatus);

export default router;
