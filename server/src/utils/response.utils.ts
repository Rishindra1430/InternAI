import type { Response } from 'express';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

interface ApiResponse {
  success: boolean;
  data: unknown;
  message: string;
}

export function sendSuccess(
  res: Response,
  data: unknown,
  message: string,
  statusCode: number = 200
): void {
  const response: ApiResponse = {
    success: true,
    data,
    message,
  };

  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500
): void {
  const response: ApiResponse = {
    success: false,
    data: null,
    message,
  };

  res.status(statusCode).json(response);
}
