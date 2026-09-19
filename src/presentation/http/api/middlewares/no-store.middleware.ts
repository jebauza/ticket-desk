import { NextFunction, Request, Response } from 'express';

// Fuerza al navegador a no guardar/reusar la respuesta, para endpoints de
// polling que deben traer siempre datos frescos (evita 304 por caché).
export const noStoreMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.set('Cache-Control', 'no-store');
  next();
};
