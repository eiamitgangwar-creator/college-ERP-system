import express from 'express';
import { createTeacher, getAllTeachers, updateTeacher, deleteTeacher } from './teacher.controller'; 
import { protect, authorizeRoles } from '../../middlewares/authMiddleware'; 

const router = express.Router();

router.post('/add', protect as any, authorizeRoles('admin'), createTeacher);
router.get('/all', protect as any, authorizeRoles('admin'), getAllTeachers);
router.put('/:id', protect as any, authorizeRoles('admin'), updateTeacher);
router.delete('/:id', protect as any, authorizeRoles('admin'), deleteTeacher);

export default router;
