import mongoose, { Schema, Document } from 'mongoose';

export interface IFees extends Document {
    student: mongoose.Types.ObjectId;
    amount: number;
    status: 'Paid' | 'Pending';
    paymentDate?: Date;
    receiptNumber?: string;
}

const feesSchema: Schema = new Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Fees amount is required']
    },
    status: {
        type: String,
        enum: ['Paid', 'Pending'],
        default: 'Pending'
    },
        month: {
        type: String,
        required: [true, 'Fee month is required'],
        enum: ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March']
    },
    paymentDate: {
        type: Date
    },
    receiptNumber: {
        type: String,
        unique: true,
        sparse: true 
    }
}, {
    timestamps: true
});


const Fees = mongoose.models.Fees || mongoose.model<IFees>('Fees', feesSchema);
export default Fees; 
