import { Schema, model, Document, Types } from 'mongoose';

export interface IProject extends Document {
  _id: Types.ObjectId | string; //did this change for production
  name: string;
  description: string;
  owner: Types.ObjectId;
  team: Types.ObjectId[];
  status: 'active' | 'completed' | 'archived';
  deadline?: Date;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  team: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
  deadline: { type: Date },
  progress: { type: Number, default: 0 },
}, { timestamps: true });

export const Project = model<IProject>('Project', projectSchema);
export default Project;
