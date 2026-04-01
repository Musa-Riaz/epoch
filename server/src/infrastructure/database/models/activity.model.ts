import { Schema, model, Document, Types } from 'mongoose';

export type ActivityActionType =
  | 'project.created'
  | 'project.status-updated'
  | 'task.created'
  | 'task.updated'
  | 'task.deleted'
  | 'task.assigned'
  | 'task.bulk-status-updated'
  | 'comment.created';

export interface IActivity extends Document {
  actorId: Types.ObjectId;
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;
  actionType: ActivityActionType;
  targetType: 'project' | 'task' | 'comment';
  targetId: Types.ObjectId;
  projectId?: Types.ObjectId;
  projectName?: string;
  targetName?: string;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorName: { type: String, trim: true },
    actorEmail: { type: String, trim: true },
    actorRole: { type: String, trim: true },
    actionType: {
      type: String,
      enum: [
        'project.created',
        'project.status-updated',
        'task.created',
        'task.updated',
        'task.deleted',
        'task.assigned',
        'task.bulk-status-updated',
        'comment.created',
      ],
      required: true,
    },
    targetType: { type: String, enum: ['project', 'task', 'comment'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    projectName: { type: String, trim: true },
    targetName: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

activitySchema.index({ createdAt: -1 });
activitySchema.index({ projectId: 1, createdAt: -1 });
activitySchema.index({ actorId: 1, createdAt: -1 });

export const Activity = model<IActivity>('Activity', activitySchema);
export default Activity;
