import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
    name: string;
    email: string;
    rollNumber: string;
    department: string;  // 🏢 e.g., "Department of Humanities"
    course: string;      // 🎓 e.g., "BA", "B.Tech (Computer Science)"
    semester: string;    // 📅 e.g., "1st Sem"
    guardianName: string;
    guardianPhone: string;
    feesPaid: boolean;
}

const studentSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'Student name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true
    },
    rollNumber: {
        type: String,
        required: [true, 'Roll number is required'],
        unique: true
    },
    department: {        
        type: String,
        required: [true, 'Department is required'],
        default: 'Department of Humanities'
    },
    course: {            
        type: String,
        required: [true, 'Course/Branch is required'],
        default: 'B.Sc'
    },
    semester: {          
        type: String,
        required: [true, 'Semester is required'],
        default: '1st Sem'
    },
    guardianName: {
        type: String,
        required: [true, 'Guardian name is required']
    },
    guardianPhone: {
        type: String,
        required: [true, 'Guardian phone number is required']
    },
    feesPaid: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Student = mongoose.models.Student || mongoose.model<IStudent>('Student', studentSchema);
export default Student;
