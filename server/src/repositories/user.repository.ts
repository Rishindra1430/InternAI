import mongoose from 'mongoose';
import User, { type IUser, type IUserDocument } from '../models/User.model.js';

const userRepository = {
  async findByEmail(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email: email.toLowerCase() });
  },

  async findById(id: string): Promise<IUserDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return User.findById(id).select('-password');
  },

  async create(data: Partial<IUser>): Promise<IUserDocument> {
    const user = new User(data);
    return user.save();
  },

  async update(id: string, data: Partial<IUser>): Promise<IUserDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return User.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).select(
      '-password'
    );
  },

  async updateRefreshToken(id: string, token: string | null): Promise<IUserDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return User.findByIdAndUpdate(
      id,
      { $set: { refreshToken: token } },
      { new: true }
    ).select('-password');
  },

  async findByVerificationToken(token: string): Promise<IUserDocument | null> {
    return User.findOne({ emailVerificationToken: token });
  },

  async findByResetToken(token: string): Promise<IUserDocument | null> {
    return User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() },
    });
  },

  async findAll(
    page: number,
    limit: number
  ): Promise<{ users: IUserDocument[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean<IUserDocument[]>(),
      User.countDocuments(),
    ]);
    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  async deleteById(id: string): Promise<IUserDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return User.findByIdAndDelete(id);
  },

  async count(): Promise<number> {
    return User.countDocuments();
  },
};

export default userRepository;
