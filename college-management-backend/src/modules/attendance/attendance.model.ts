import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
    studentId: mongoose.Types.ObjectId;
    status: 'Present' | 'Absent' | 'Leave';
    date: Date;
    department: string; // as "Department of Engineering"
    course: string;     // as "B.Tech (Computer Science)"
    semester: string;   // as "3rd Sem"
    subject: string;    // as "Data Structures"
    markedBy: mongoose.Types.ObjectId;
}

const attendanceSchema: Schema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Leave'],
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    department: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    markedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});


attendanceSchema.index({ studentId: 1, date: 1, subject: 1 }, { unique: true });


const Attendance = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', attendanceSchema);
export default Attendance;

