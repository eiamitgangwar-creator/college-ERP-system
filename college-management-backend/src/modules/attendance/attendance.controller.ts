
import { Request, Response } from 'express';
import Attendance from './attendance.model';
import Student from '../student/student.model';
import mongoose from 'mongoose';

//  MARK ATTENDANCE (Inline Export)

export async function markAttendance(req: Request, res: Response): Promise<any> {
    try {
        const {  status, date, department, course, semester, subject } = req.body;
        
        const studentId = req.body.studentId as string;  
           let loggedInUserId = ((req as any).user?.id || (req as any).user?._id) as string; 

        if (!studentId) {
            return res.status(400).json({ message: 'Student ID parameter is missing' });
        }

        // change student id to mongodb ObjectId  
       let finalStudentId: any = studentId;
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
        
            const actualStudent = await Student.findOne({ 
                $or: [
                    { rollNumber: studentId }, 
                    { email: String(studentId).toLowerCase() }
                ] 
            });
            if (!actualStudent) {
                return res.status(404).json({ message: `Student profile not found for identifier: ${studentId}` });
            }
            finalStudentId = actualStudent._id;
        } else {
            finalStudentId = new mongoose.Types.ObjectId(studentId);
        }

        if (!loggedInUserId || !mongoose.Types.ObjectId.isValid(loggedInUserId)) {
            loggedInUserId = new mongoose.Types.ObjectId().toString(); 
        }

        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        // Review of past records for a specific lecture/subject
        const existingRecord = await Attendance.findOne({
            studentId: finalStudentId,
            subject: subject.trim(),
            date: {
                $gte: targetDate,
                $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        if (existingRecord) {
            existingRecord.status = status;
            existingRecord.markedBy = loggedInUserId; 
            await existingRecord.save();
            return res.status(200).json({ message: "Attendance log synchronized! 📝" });
        }

        // insert new live lecture
        await Attendance.create({
            studentId: finalStudentId,
            status,
            date: targetDate, 
            department,
            course,
            semester,
            subject: subject.trim(),
            markedBy: loggedInUserId
        });

        return res.status(201).json({ message: "Attendance registered successfully inside collegeDB! 🎉" });

    } catch (error: any) {
        console.error("Critical Backend Attendance Logging Error:", error);
        return res.status(500).json({ message: 'Server Error during logging', error: error.message });
    }
}


// GET STUDENT ATTENDANCE (Inline Export)
export async function getStudentAttendance(req: Request, res: Response): Promise<any> {
    try {
        const  studentId  = req.params.studentId as string;

        let finalStudentId = studentId;
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            const actualStudent = await Student.findOne({ 
                $or: [{ rollNumber: studentId }, { email: studentId.toLowerCase() }] 
            });
            if (actualStudent) {
                finalStudentId = actualStudent._id as string;
            }
        }

        const history = await Attendance.find({ studentId: finalStudentId })
            .populate('markedBy', 'name role')
            .sort({ date: -1 });

        const totalDays = history.length;
        const presentDays = history.filter(h => h.status === 'Present').length;
        const absentDays = history.filter(h => h.status === 'Absent').length;
        const leaveDays = history.filter(h => h.status === 'Leave').length;

        return res.status(200).json({
            totalDays,
            presentDays,
            absentDays,
            leaveDays,
            history
        });

    } catch (error: any) {
        console.error("Error in getStudentAttendance backend:", error);
        return res.status(500).json({ message: 'Server Error while calculating attendance analytics', error: error.message });
    }
}
