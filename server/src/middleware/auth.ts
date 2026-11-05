import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { HttpError } from './error.js';

export async function protect(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new HttpError(401, 'Not authenticated');
  try {
    const { id } = jwt.verify(header.slice(7), process.env.JWT_SECRET as string) as { id: string };
    const user = await User.findById(id);
    if (!user) throw new Error('no user');
    req.user = user;
    next();
  } catch {
    throw new HttpError(401, 'Invalid or expired token');
  }
}

export function restrictTo(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) throw new HttpError(403, 'Forbidden');
    next();
  };
}
