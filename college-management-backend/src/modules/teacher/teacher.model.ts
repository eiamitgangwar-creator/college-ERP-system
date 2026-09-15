import mongoose, { Schema, Document } from 'mongoose';

export interface ITeacher extends Document {
    name: string;
    email: string;
    subject: string;     
    phone: string;
    department: string;   
    designation: string;  
}

const teacherSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'Teacher name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true
    },
    subject: {
        type: String,
        required: [true, 'Specialization subject is required']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    department: {        
        type: String,
        required: [true, 'Department name is required'],
        default: 'Department of Engineering'
    },
    designation: {        
        type: String,
        required: [true, 'Designation is required'],
        default: 'Assistant Professor'
    }
}, {
    timestamps: true 
});

const Teacher = mongoose.models.Teacher || mongoose.model<ITeacher>('Teacher', teacherSchema);
export default Teacher;
