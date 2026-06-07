import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/response.utils.js';
import { ZodError } from 'zod';

interface MongooseValidationError extends Error {
  name: 'ValidationError';
  errors: Record<string, { message: string }>;
}

interface MongooseCastError extends Error {
  name: 'CastError';
  path: string;
  value: unknown;
}

interface MongooseDuplicateKeyError extends Error {
  code: number;
  keyValue: Record<string, unknown>;
}

interface JwtError extends Error {
  name: 'JsonWebTokenError' | 'TokenExpiredError';
}

interface ErrorResponseBody {
  success: false;
  data: null;
  message: string;
}

const isMongooseValidationError = (
  err: Error
): err is MongooseValidationError => {
  return err.name === 'ValidationError' && 'errors' in err;
};

const isMongooseCastError = (err: Error): err is MongooseCastError => {
  return err.name === 'CastError';
};

const isDuplicateKeyError = (err: Error): err is MongooseDuplicateKeyError => {
  return 'code' in err && (err as MongooseDuplicateKeyError).code === 11000;
};

const isJwtError = (err: Error): err is JwtError => {
  return err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError';
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(`[Error] ${err.name}: ${err.message}`);
  console.error(err.stack);

  const response: ErrorResponseBody = {
    success: false,
    data: null,
    message: 'Internal Server Error',
  };

  let statusCode = 500;

  // AppError — operational errors with known status codes
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    response.message = err.message;
    res.status(statusCode).json(response);
    return;
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    const formattedErrors = err.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join('; ');
    response.message = `Validation failed: ${formattedErrors}`;
    res.status(statusCode).json(response);
    return;
  }

  // Mongoose ValidationError
  if (isMongooseValidationError(err)) {
    statusCode = 400;
    const messages = Object.values(err.errors)
      .map((e) => e.message)
      .join('; ');
    response.message = `Validation failed: ${messages}`;
    res.status(statusCode).json(response);
    return;
  }

  // Mongoose CastError (invalid ObjectId, etc.)
  if (isMongooseCastError(err)) {
    statusCode = 400;
    response.message = `Invalid value for ${err.path}: ${String(err.value)}`;
    res.status(statusCode).json(response);
    return;
  }

  // Mongoose duplicate key error (code 11000)
  if (isDuplicateKeyError(err)) {
    statusCode = 409;
    const duplicateFields = Object.keys(err.keyValue).join(', ');
    response.message = `Duplicate value for field(s): ${duplicateFields}. Please use a different value.`;
    res.status(statusCode).json(response);
    return;
  }

  // JWT errors
  if (isJwtError(err)) {
    statusCode = 401;
    response.message =
      err.name === 'TokenExpiredError'
        ? 'Token has expired. Please log in again.'
        : 'Invalid token. Please log in again.';
    res.status(statusCode).json(response);
    return;
  }

  // Default: 500 Internal Server Error
  res.status(statusCode).json(response);
};
