import { Request, Response } from 'express';
import Teacher from './teacher.model'; 

// CREATE FACULTY 
export const createTeacher = async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, email, subject, phone, department, designation } = req.body;

        const teacherExists = await Teacher.findOne({ email: email.toLowerCase() });
        if (teacherExists) {
            return res.status(400).json({ message: 'Faculty member with this email already exists!' });
        }

        const newTeacher = await Teacher.create({
            name,
            email: email.toLowerCase(),
            subject, // Specialization
            phone,
            department,
            designation
        });

        res.status(201).json({
            message: "Faculty member registered successfully inside collegeDB! 🎉",
            teacher: newTeacher
        });

    } catch (error: any) {
        console.error("Backend Teacher Creation Error:", error);
        res.status(500).json({ message: 'Server Error during faculty enrollment', error: error.message });
    }
};

// GET ALL FACULTY
export const getAllTeachers = async (req: Request, res: Response): Promise<any> => {
    try {
        const teachers = await Teacher.find({}).sort({ createdAt: -1 });
        return res.status(200).json(teachers || []);
    } catch (error: any) {
        console.error("Error in getAllTeachers backend:", error);
        return res.status(200).json([]); 
    }
};


// UPDATE FACULTY 
export const updateTeacher = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updatedTeacher) {
            return res.status(404).json({ message: 'Faculty record not found' });
        }

        res.status(200).json({
            message: 'Faculty details updated successfully! 📝',
            teacher: updatedTeacher
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Server Error during faculty update', error: error.message });
    }
};

//  DELETE FACULTY 
export const deleteTeacher = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        
        const deletedTeacher = await Teacher.findByIdAndDelete(id);

        if (!deletedTeacher) {
            return res.status(404).json({ message: 'Faculty record not found' });
        }

        res.status(200).json({
            message: 'Faculty member removed from collegeDB successfully! 🗑️'
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Server Error during faculty deletion', error: error.message });
    }
};
