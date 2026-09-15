import { Request, Response } from 'express';
import Fees from './fees.model';
import Student from '../student/student.model';

// 1. छात्र की फीस जमा करें (सिर्फ Admin के लिए)
export const submitFees = async (req: Request, res: Response): Promise<any> => {
    try {
        const { studentId, amount, receiptNumber, month } = req.body;

        // चेक करें कि छात्र मौजूद है या नहीं
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found!" });
        }

        // नया फीस रिकॉर्ड बनाएं या पुराने पेंडिंग को अपडेट करें
        const newReceipt = new Fees({
            student: studentId,
            amount,
            status: 'Paid',
            month,
            paymentDate: new Date(),
            receiptNumber
        });

        await newReceipt.save();

        // छात्र के मॉडल में भी feesPaid को true कर दें
        student.feesPaid = true;
        await student.save();

        res.status(201).json({ message: "Fees submitted successfully! 💰", receipt: newReceipt });
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Receipt number already exists! Please try again." });
        }
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 2. किसी छात्र का फीस स्टेटस देखें
export const getFeesStatus = async (req: Request, res: Response): Promise<any> => {
    try {
        const { studentId } = req.params;

        const feesRecord = await Fees.find({ student: studentId }).populate('student', 'name rollNumber studentClass');
        
        if (feesRecord.length === 0) {
            return res.status(200).json({ status: "Pending/No record found", history: [] });
        }

        res.status(200).json(feesRecord);
    } catch (error: any) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
