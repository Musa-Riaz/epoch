import { Schema, model, Document, Types } from 'mongoose';

export type NotificationType =
  | 'task.assigned'
  | 'task.created'
  | 'task.updated'
  | 'task.bulk-status-updated'
  | 'comment.created'
  | 'project.created'
  | 'project.status-updated';

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedType: 'project' | 'task' | 'comment';
  relatedId: Types.ObjectId;
  projectId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'task.assigned',
        'task.created',
        'task.updated',
        'task.bulk-status-updated',
        'comment.created',
        'project.created',
        'project.status-updated',
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
    relatedType: { type: String, enum: ['project', 'task', 'comment'], required: true },
    relatedId: { type: Schema.Types.ObjectId, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ projectId: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);
export default Notification;
