import { Request, Response } from 'express';
import Grade from './grade.model';
import mongoose from 'mongoose';

// SUBMIT OR UPDATE MARKS 
export const submitGrade = async (req: Request, res: Response): Promise<any> => {
    try {
        const { studentId, type, title, subject, maxMarks, obtainedMarks, department, course, semester } = req.body;
        const loggedInUserId = (req as any).user?.id || (req as any).user?._id;

        if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: 'Invalid or missing Student Object ID' });
        }

        // 
        const existingGrade = await Grade.findOne({ studentId, type, title, subject });

        if (existingGrade) {
            existingGrade.obtainedMarks = Number(obtainedMarks);
            existingGrade.maxMarks = Number(maxMarks);
            existingGrade.markedBy = loggedInUserId;
            await existingGrade.save();
            return res.status(200).json({ message: "Marks synchronized successfully! 📝" });
        }

        const newGrade = await Grade.create({
            studentId, type, title, subject,
            maxMarks: Number(maxMarks), obtainedMarks: Number(obtainedMarks),
            department, course, semester, markedBy: loggedInUserId
        });

        res.status(201).json({ message: "Marks registered inside collegeDB! 🎉", grade: newGrade });
    } catch (error: any) {
        res.status(500).json({ message: 'Server Error during grading', error: error.message });
    }
};

// GET STUDENT REPORT CARD 
export const getStudentGrades = async (req: Request, res: Response): Promise<any> => {
    try {
        const { studentId } = req.params;
        const grades = await Grade.find({ studentId }).populate('markedBy', 'name').sort({ createdAt: -1 });
        res.status(200).json(grades || []);
    } catch (error: any) {
        res.status(500).json({ message: 'Server Error fetching grades', error: error.message });
    }
};
