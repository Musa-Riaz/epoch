import { Schema, model, Document, Types } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  projectId: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: { type: Date },
}, { timestamps: true });

export const Task = model<ITask>('Task', taskSchema);
export default Task;
