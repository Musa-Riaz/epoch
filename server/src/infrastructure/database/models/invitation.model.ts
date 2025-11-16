import { Schema, model, Document, Types } from 'mongoose';
import crypto from 'crypto';

export interface IInvitation extends Document {
  email: string;
  projectId: Types.ObjectId;
  token: string;
  invitedBy: Types.ObjectId;
  status: 'pending' | 'accepted' | 'expired' | 'rejected';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const invitationSchema = new Schema<IInvitation>({
  email: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true 
  },
  projectId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  token: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => crypto.randomBytes(32).toString('hex')
  },
  invitedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'expired', 'rejected'], 
    default: 'pending' 
  },
  expiresAt: { 
    type: Date, 
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  }
}, { timestamps: true });

// Index for faster queries
invitationSchema.index({ email: 1, projectId: 1 });
invitationSchema.index({ token: 1 });
invitationSchema.index({ expiresAt: 1 });

// Method to check if invitation is valid
invitationSchema.methods.isValid = function(): boolean {
  return this.status === 'pending' && this.expiresAt > new Date();
};

export const Invitation = model<IInvitation>('Invitation', invitationSchema);
export default Invitation;
