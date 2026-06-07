import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils.js';
import { AppError } from '../utils/response.utils.js';

interface JwtPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication required. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new AppError('Authentication required. Token is malformed.', 401);
  }

  const decoded = verifyAccessToken(token) as JwtPayload;

  if (!decoded || !decoded.userId || !decoded.role) {
    throw new AppError('Invalid or expired token.', 401);
  }

  req.user = {
    userId: decoded.userId,
    role: decoded.role,
  };

  next();
};
