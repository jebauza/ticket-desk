import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../../../domain/errors/custom.error';

export function errorHandler(error: unknown, req: Request, res: Response, next: NextFunction) {
  if (error instanceof CustomError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
}
