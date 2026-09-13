import { NextFunction, Request, Response } from 'express';

// Defensa en profundidad, NO la protección principal: la protección real contra
// SQL injection son las queries parametrizadas ($1, $2, ...) en los datasources.
// Este middleware es una capa extra que rechaza temprano (400) payloads que
// contienen patrones típicos de intentos de inyección, y los deja logueados
// para poder alertar/monitorear. Corre después de los parsers de body/query.
const SQLI_PATTERN =
  /(\b(union\s+select|select\s+.+\s+from|insert\s+into|drop\s+table|alter\s+table|update\s+.+\s+set|delete\s+from|exec(\s|\()|xp_cmdshell)\b)|(--)|(\/\*.*\*\/)|(;\s*(drop|delete|update|insert)\b)|('|")\s*(or|and)\s*('|")?\s*\w+\s*('|")?\s*=\s*('|")?\s*\w+|\b(or|and)\b\s*\d+\s*=\s*\d+/i;

function containsSqlInjectionPattern(value: unknown): boolean {
  if (typeof value === 'string') return SQLI_PATTERN.test(value);

  if (Array.isArray(value)) return value.some(containsSqlInjectionPattern);

  if (value && typeof value === 'object') {
    return Object.values(value).some(containsSqlInjectionPattern);
  }

  return false;
}

export function sqlInjectionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Nota: este middleware se monta a nivel de app, antes de que Express resuelva
  // la ruta — en ese punto req.params todavía está vacío para rutas con
  // segmentos dinámicos (ej. /draw/:desk). Por eso también se revisa el path
  // crudo de la URL, que sí está disponible en esta etapa del pipeline.
  const suspicious =
    containsSqlInjectionPattern(req.body) ||
    containsSqlInjectionPattern(req.query) ||
    containsSqlInjectionPattern(req.params) ||
    containsSqlInjectionPattern(decodeURIComponent(req.path));

  if (suspicious) {
    console.warn(
      `[sql-injection-middleware] blocked suspicious request ip=${req.ip} method=${req.method} path=${req.originalUrl}`,
    );
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  next();
}
