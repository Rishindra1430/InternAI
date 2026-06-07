import mongoose from 'mongoose';
import Resume, { type IResume, type IResumeDocument } from '../models/Resume.model.js';

const resumeRepository = {
  async findByUser(userId: string): Promise<IResumeDocument[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) return [];
    return Resume.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ version: -1 })
      .lean<IResumeDocument[]>();
  },

  async findById(id: string): Promise<IResumeDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Resume.findById(id).lean<IResumeDocument>();
  },

  async create(data: Partial<IResume>): Promise<IResumeDocument> {
    const resume = new Resume(data);
    return resume.save();
  },

  async updateAtsScore(id: string, score: number): Promise<IResumeDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Resume.findByIdAndUpdate(
      id,
      { $set: { atsScore: score } },
      { new: true, runValidators: true }
    ).lean<IResumeDocument>();
  },

  async updateExtractedData(
    id: string,
    data: {
      skills?: string[];
      experience?: string[];
      education?: string[];
    }
  ): Promise<IResumeDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const update: Record<string, string[]> = {};
    if (data.skills) update.extractedSkills = data.skills;
    if (data.experience) update.extractedExperience = data.experience;
    if (data.education) update.extractedEducation = data.education;

    return Resume.findByIdAndUpdate(id, { $set: update }, { new: true }).lean<IResumeDocument>();
  },

  async deleteById(id: string): Promise<IResumeDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Resume.findByIdAndDelete(id);
  },

  async countByUser(userId: string): Promise<number> {
    if (!mongoose.Types.ObjectId.isValid(userId)) return 0;
    return Resume.countDocuments({ userId: new mongoose.Types.ObjectId(userId) });
  },

  async getNextVersion(userId: string): Promise<number> {
    if (!mongoose.Types.ObjectId.isValid(userId)) return 1;
    const latest = await Resume.findOne({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ version: -1 })
      .select('version')
      .lean<Pick<IResumeDocument, 'version'>>();
    return latest ? latest.version + 1 : 1;
  },
};

export default resumeRepository;
