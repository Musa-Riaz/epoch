import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'member';
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  firstName: { type: String, required: [true, "First name is required"], trim: true },
  lastName: { type: String, required: [true, "Last name is required"], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true, match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'] },
   password: { type: String, required: [true, 'Password is required'], minlength: [8, 'Password must be at least 8 characters long'] },
  role: { type: String, enum: ['admin', 'manager', 'member'], default: 'member' },
  profilePicture: { type: String },
}, { timestamps: true });

export const User = model<IUser>('User', userSchema);
export default User;
