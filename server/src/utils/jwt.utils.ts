import * as jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AccessTokenPayload {
  userId: string;
  email?: string;
  role?: string;
}

export interface RefreshTokenPayload {
  userId: string;
}

export interface DecodedAccessToken extends AccessTokenPayload {
  iat: number;
  exp: number;
}

export interface DecodedRefreshToken extends RefreshTokenPayload {
  iat: number;
  exp: number;
}

export function generateAccessToken(payload: AccessTokenPayload): string {
  return (jwt.sign as any)(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
  });
}

export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return (jwt.sign as any)(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
  });
}

export function verifyAccessToken(token: string): DecodedAccessToken {
  const decoded = (jwt.verify as any)(token, env.JWT_ACCESS_SECRET);

  if (typeof decoded === 'string') {
    throw new Error('Invalid access token payload');
  }

  return decoded as DecodedAccessToken;
}

export function verifyRefreshToken(token: string): DecodedRefreshToken {
  const decoded = (jwt.verify as any)(token, env.JWT_REFRESH_SECRET);

  if (typeof decoded === 'string') {
    throw new Error('Invalid refresh token payload');
  }

  return decoded as DecodedRefreshToken;
}
