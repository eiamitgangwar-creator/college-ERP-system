import express from 'express';
import authRoutes from './modules/auth/auth.routes';
import studentRoutes from './modules/student/student.routes';
import teacherRoutes from './modules/teacher/teacher.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import feesRoutes from './modules/fees/fees.routes'; 
import gradeRoutes from './modules/grade/grade.routes';

const rootRouter = express.Router();

rootRouter.use('/auth', authRoutes);
rootRouter.use('/students', studentRoutes);
rootRouter.use('/teachers', teacherRoutes);
rootRouter.use('/attendance', attendanceRoutes);
rootRouter.use('/fees', feesRoutes);
rootRouter.use('/grades',gradeRoutes);
export default rootRouter;
