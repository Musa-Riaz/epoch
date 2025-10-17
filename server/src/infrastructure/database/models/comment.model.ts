import { Schema, model, Document, Types } from 'mongoose';

export interface IComment extends Document {
  taskId: Types.ObjectId;
  authorId: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
}, { timestamps: true });

export const Comment = model<IComment>('Comment', commentSchema);
export default Comment;
