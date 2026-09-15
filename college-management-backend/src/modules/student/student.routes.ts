import express from 'express';
import { createStudent, getAllStudents, updateStudent, deleteStudent} from './student.controller';
import { protect, authorizeRoles } from '../../middlewares/authMiddleware'; 

const router = express.Router();


router.post('/add', protect as any, authorizeRoles('admin'), createStudent);
router.get('/all', protect as any, authorizeRoles('admin', 'teacher'), getAllStudents);
router.put('/:id', protect as any, authorizeRoles('admin'), updateStudent);
router.delete('/:id', protect as any, authorizeRoles('admin'), deleteStudent);


export default router;
