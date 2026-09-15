import mongoose, { Schema, Document } from 'mongoose';

// 1. Interface
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: string;
}

// 2. Mongoose Schema
const userSchema: Schema = new Schema({
    name: { type: String, required: [true, 'Name is required'] },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true },
    password: { type: String, required: [true, 'Password is required'] },
    role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' }
}, {
    timestamps: true
});


const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default User;
