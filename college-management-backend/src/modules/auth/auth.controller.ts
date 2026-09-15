import { Request, Response } from 'express';
import User from './user.model';
import Student from '../student/student.model'; 
import Teacher from '../teacher/teacher.model'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


// USER REGISTRATION (Sign Up)

export const registerUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role || 'student'
        });

        res.status(201).json({
            message: "User registered successfully! 🎉",
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });

    } catch (error: any) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


// USER LOGIN 
export const loginUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        
        let studentDetails = null;
        let teacherDetails = null;

        try {
            if (user.role === 'student' && Student) {
                studentDetails = await Student.findOne({ email: email.toLowerCase() });
            } else if (user.role === 'teacher' && Teacher) {
                teacherDetails = await Teacher.findOne({ email: email.toLowerCase() });
            }
        } catch (dbErr) {
            console.log("Profile collections not populated yet, skipping details fetch gracefully.");
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '30d' }
        );

        res.status(200).json({
            message: "Login successful! 🔑",
            token,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role,
                
                
                studentId: studentDetails ? studentDetails._id : user._id,
                studentClass: studentDetails?.department || 'Not Assigned',
                section: studentDetails?.semester || 'None',
                rollNumber: studentDetails?.rollNumber || 'N/A',
                guardianName: studentDetails?.guardianName || 'Not Registered',
                guardianPhone: studentDetails?.guardianPhone || 'N/A',
                feesPaid: studentDetails?.feesPaid || false,

                
                subject: teacherDetails?.subject || 'Not Assigned',
                classTeacherOf: teacherDetails?.designation || 'None',
                phone: teacherDetails?.phone || 'N/A'
            }
        });

    } catch (error: any) {
        res.status(500).json({ message: 'Server Error during query mapping', error: error.message });
    }
};
