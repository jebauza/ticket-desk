import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../shared/api-response';

// Límite general para toda la API: evita que una sola IP sature el servidor
// (fuerza bruta, scraping agresivo, o un cliente con un bug en loop).
export const apiRateLimiterMiddleware = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: ApiResponse.error('Too many requests, please try again later'),
});

// Límite más estricto para endpoints de escritura (crean/mutan tickets),
// que son los que más impactan la base de datos por request.
export const writeRateLimiterMiddleware = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: ApiResponse.error('Too many requests, please try again later'),
});
