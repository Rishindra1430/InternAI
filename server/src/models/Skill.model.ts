import mongoose from 'mongoose';

export interface ISkill {
  name: string;
  category: 'programming' | 'framework' | 'database' | 'tool' | 'soft_skill' | 'other';
  aliases: string[];
}

export interface ISkillDocument extends ISkill, mongoose.Document {}

const skillSchema = new mongoose.Schema<ISkillDocument>(
  {
    name: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: {
      type: String,
      enum: ['programming', 'framework', 'database', 'tool', 'soft_skill', 'other'],
      required: true,
    },
    aliases: { type: [String], default: [] },
  },
  { timestamps: false }
);

skillSchema.index({ name: 1 }, { unique: true });

const Skill = mongoose.model<ISkillDocument>('Skill', skillSchema);

export default Skill;
