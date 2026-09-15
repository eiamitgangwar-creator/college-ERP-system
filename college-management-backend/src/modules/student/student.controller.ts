
import { Request, Response } from 'express';
import Student from './student.model'; 

// CREATE STUDENT 
export const createStudent = async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, email, rollNumber, department, course, semester, guardianName, guardianPhone } = req.body;

        const studentExists = await Student.findOne({ 
            $or: [{ email: email.toLowerCase() }, { rollNumber }] 
        });

        if (studentExists) {
            return res.status(400).json({ message: 'Student with this Email or Roll Number already exists!' });
        }

        const newStudent = await Student.create({
            name,
            email: email.toLowerCase(),
            rollNumber,
            department,
            course, 
            semester,
            guardianName,
            guardianPhone
        });

        res.status(201).json({
            message: "Student registered successfully inside collegeDB! 🎉",
            student: newStudent
        });

    } catch (error: any) {
        console.error("Backend Student Creation Error:", error);
        res.status(500).json({ message: 'Server Error during enrollment', error: error.message });
    }
};

//  GET ALL STUDENTS 
export const getAllStudents = async (req: Request, res: Response): Promise<any> => {
    try {
        // get students from database
        const students = await Student.find({}).sort({ createdAt: -1 });
        return res.status(200).json(students || []);
    } catch (error: any) {
        console.error("Error in getAllStudents backend:", error);
        return res.status(200).json([]); 
    }
};


// UPDATE STUDENT 
export const updateStudent = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        
        const updatedStudent = await Student.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student record not found' });
        }

        res.status(200).json({
            message: 'Student record updated successfully! 📝',
            student: updatedStudent
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Server Error during update', error: error.message });
    }
};

// DELETE STUDENT 
export const deleteStudent = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        
        const deletedStudent = await Student.findByIdAndDelete(id);

        if (!deletedStudent) {
            return res.status(404).json({ message: 'Student record not found' });
        }

        res.status(200).json({
            message: 'Student record deleted from collegeDB successfully! 🗑️'
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Server Error during deletion', error: error.message });
    }
};
