import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../../../../domain/errors/custom.error';
import { ApiResponse } from '../shared/api-response';

export function errorHandlerMiddleware(error: unknown, req: Request, res: Response, next: NextFunction) {
  if (error instanceof CustomError) {
    res.status(error.statusCode).json(ApiResponse.error(error.message));
    return;
  }

  console.error(error);
  res.status(500).json(ApiResponse.error('Internal server error'));
}
