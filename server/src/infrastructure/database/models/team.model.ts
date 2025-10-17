import { Schema, model, Document, Types } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  members: Types.ObjectId[];
  projects: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>({
  name: { type: String, required: true, trim: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
}, { timestamps: true });

export const Team = model<ITeam>('Team', teamSchema);
export default Team;
