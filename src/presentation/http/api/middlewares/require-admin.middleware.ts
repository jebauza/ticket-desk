import { NextFunction, Request, Response } from 'express';

// Gatea con el role simple ('ADMIN'|'USER') que ya existe en UserEntity, NO
// con el RBAC granular (Role/Permission) que este middleware protege —
// evita el problema de arranque: para poder asignar el primer Role a un
// usuario, alguien ya tiene que poder administrar el sistema.
// Debe montarse después de authMiddleware (necesita req.user poblado).
export function requireAdminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.isAdmin) {
    res.status(403).json({ error: 'Admin role required' });
    return;
  }

  next();
}
