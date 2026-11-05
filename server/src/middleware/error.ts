import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, `Not found: ${req.originalUrl}`));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  let status = 500;
  let message = 'Server error';
  if (err instanceof HttpError) {
    status = err.status;
    message = err.message;
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if ((err as { code?: number }).code === 11000) {
    status = 409;
    message = 'Duplicate value: resource already exists';
  } else {
    console.error(err);
  }
  res.status(status).json({ message });
}
