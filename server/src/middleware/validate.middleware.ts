import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/response.utils.js';

type ValidationSource = 'body' | 'query' | 'params';

export const validate = (
  schema: ZodSchema,
  source: ValidationSource = 'body'
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const zodError = result.error as ZodError;
      const formattedMessages = zodError.errors
        .map((err) => {
          const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
          return `${path}${err.message}`;
        })
        .join('; ');

      throw new AppError(`Validation failed: ${formattedMessages}`, 400);
    }

    req[source] = result.data;
    next();
  };
};
