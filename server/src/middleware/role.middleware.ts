import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/response.utils.js';

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(
        'Authentication required before role authorization.',
        401
      );
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(
        `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}.`,
        403
      );
    }

    next();
  };
};
