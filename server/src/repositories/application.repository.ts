import mongoose from 'mongoose';
import Application, { type IApplicationDocument } from '../models/Application.model.js';

interface StatusCount {
  _id: string;
  count: number;
}

const applicationRepository = {
  async findByUser(
    userId: string,
    status?: string
  ): Promise<IApplicationDocument[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) return [];
    const query: Record<string, unknown> = { userId: new mongoose.Types.ObjectId(userId) };
    if (status) {
      query.status = status;
    }
    return Application.find(query)
      .populate('jobId')
      .sort({ appliedAt: -1 })
      .lean<IApplicationDocument[]>();
  },

  async findById(id: string): Promise<IApplicationDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Application.findById(id).populate('jobId').lean<IApplicationDocument>();
  },

  async findByUserAndJob(
    userId: string,
    jobId: string
  ): Promise<IApplicationDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(jobId)) {
      return null;
    }
    return Application.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      jobId: new mongoose.Types.ObjectId(jobId),
    }).lean<IApplicationDocument>();
  },

  async create(data: {
    userId: string;
    jobId: string;
    status?: string;
    notes?: string;
  }): Promise<IApplicationDocument> {
    const initialStatus = data.status ?? 'Applied';
    const application = new Application({
      userId: new mongoose.Types.ObjectId(data.userId),
      jobId: new mongoose.Types.ObjectId(data.jobId),
      status: initialStatus,
      notes: data.notes,
      timeline: [
        {
          status: initialStatus,
          changedAt: new Date(),
          note: data.notes ?? 'Application submitted',
        },
      ],
    });
    const saved = await application.save();
    return saved.populate('jobId');
  },

  async updateStatus(
    id: string,
    status: string,
    note?: string
  ): Promise<IApplicationDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Application.findByIdAndUpdate(
      id,
      {
        $set: { status },
        $push: {
          timeline: {
            status,
            changedAt: new Date(),
            note,
          },
        },
      },
      { new: true, runValidators: true }
    )
      .populate('jobId')
      .lean<IApplicationDocument>();
  },

  async updateNotes(id: string, notes: string): Promise<IApplicationDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Application.findByIdAndUpdate(
      id,
      { $set: { notes } },
      { new: true }
    )
      .populate('jobId')
      .lean<IApplicationDocument>();
  },

  async setInterviewDate(id: string, date: Date): Promise<IApplicationDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Application.findByIdAndUpdate(
      id,
      { $set: { interviewDate: date } },
      { new: true }
    )
      .populate('jobId')
      .lean<IApplicationDocument>();
  },

  async deleteById(id: string): Promise<IApplicationDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Application.findByIdAndDelete(id);
  },

  async countByUser(userId: string): Promise<number> {
    if (!mongoose.Types.ObjectId.isValid(userId)) return 0;
    return Application.countDocuments({ userId: new mongoose.Types.ObjectId(userId) });
  },

  async countByStatus(userId: string): Promise<Record<string, number>> {
    if (!mongoose.Types.ObjectId.isValid(userId)) return {};
    const results: StatusCount[] = await Application.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const counts: Record<string, number> = {};
    for (const entry of results) {
      counts[entry._id] = entry.count;
    }
    return counts;
  },

  async getRecentByUser(
    userId: string,
    limit: number
  ): Promise<IApplicationDocument[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) return [];
    return Application.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('jobId')
      .sort({ appliedAt: -1 })
      .limit(limit)
      .lean<IApplicationDocument[]>();
  },
};

export default applicationRepository;
