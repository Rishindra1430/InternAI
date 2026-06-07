import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import userRepository from '../repositories/user.repository.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.utils.js';
import { AppError } from '../utils/response.utils.js';

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface LoginResult {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

interface SafeUser {
  _id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

function stripPassword(user: any): SafeUser {
  const userObj = typeof user?.toObject === 'function' ? user.toObject() : { ...user };
  const { password: _password, ...safeUser } = userObj as Record<string, unknown> & { password?: string };
  return safeUser as SafeUser;
}

export const authService = {
  async register(data: RegisterData): Promise<SafeUser> {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      emailVerificationToken: verificationToken,
      isEmailVerified: false,
    });

    await sendVerificationEmail(user.email, verificationToken);

    return stripPassword(user);
  },

  async login(data: LoginData): Promise<LoginResult> {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isEmailVerified) {
      throw new AppError('Please verify your email before logging in', 403);
    }

    const userId = String(user._id);
    const accessToken = generateAccessToken({ userId, email: user.email });
    const refreshToken = generateRefreshToken({ userId });

    await userRepository.updateRefreshToken(userId, refreshToken);

    return {
      user: stripPassword(user),
      accessToken,
      refreshToken,
    };
  },

  async logout(userId: string): Promise<void> {
    await userRepository.updateRefreshToken(userId, null);
  },

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    const payload = verifyRefreshToken(token);
    if (!payload || !payload.userId) {
      throw new AppError('Invalid refresh token', 401);
    }

    const user = await userRepository.findById(payload.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.refreshToken !== token) {
      throw new AppError('Refresh token mismatch — possible token reuse', 401);
    }

    const accessToken = generateAccessToken({
      userId: String(user._id),
      email: user.email,
    });

    return { accessToken };
  },

  async verifyEmail(token: string): Promise<void> {
    const user = await userRepository.findByVerificationToken(token);
    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    await userRepository.update(String(user._id), {
      isEmailVerified: true,
      emailVerificationToken: undefined,
    });
  },

  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Return silently to prevent email enumeration
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await userRepository.update(String(user._id), {
      resetPasswordToken: resetToken,
      resetPasswordExpiry: resetTokenExpiry,
    });

    await sendPasswordResetEmail(user.email, resetToken);
  },

  async resetPassword(token: string, password: string): Promise<void> {
    const user = await userRepository.findByResetToken(token);
    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await userRepository.update(String(user._id), {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpiry: undefined,
    });
  },

  async getMe(userId: string): Promise<SafeUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return stripPassword(user);
  },
};
