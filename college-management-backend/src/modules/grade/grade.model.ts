import mongoose, { Schema, Document } from 'mongoose';

export interface IGrade extends Document {
    studentId: mongoose.Types.ObjectId;
    type: 'Assignment' | 'Test' | 'Exam';
    title: string;       // e.g., "Assignment 1" or "Mid-Sem Test"
    subject: string;     // e.g., "Data Structures"
    maxMarks: number;    // e.g., 100
    obtainedMarks: number; // e.g., 85
    department: string;
    course: string;
    semester: string;
    markedBy: mongoose.Types.ObjectId;
}

const gradeSchema: Schema = new Schema({
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    type: { type: String, enum: ['Assignment', 'Test', 'Exam'], required: true },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    maxMarks: { type: Number, required: true, default: 100 },
    obtainedMarks: { type: Number, required: true },
    department: { type: String, required: true },
    course: { type: String, required: true },
    semester: { type: String, required: true },
    markedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});

// Add an index to prevent duplicate test records for the same student.
gradeSchema.index({ studentId: 1, type: 1, title: 1, subject: 1 }, { unique: true });

const Grade = mongoose.models.Grade || mongoose.model<IGrade>('Grade', gradeSchema);
export default Grade;
