import { NextFunction, Request, Response } from 'express';
import { UserRepository } from '../../../../domain/repositories/user.repository';
import { TokenManager } from '../../../../domain/interfaces/token-manager';
import { UserEntity } from '../../../../domain/entities/user.entity';

interface TokenPayload {
  id: string;
}

// El usuario autenticado se adjunta al request para que los controllers lo
// lean sin volver a tocar el repositorio.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: UserEntity;
    }
  }
}

// Factory en vez de middleware suelto: necesita el repositorio (para cargar
// el usuario) y el TokenManager (para verificar), ambos inyectados desde el
// composition root de cada feature — igual que datasource/repository/service.
export function authMiddleware(
  repository: UserRepository,
  tokenManager: TokenManager,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.slice('Bearer '.length);

    try {
      const payload = await tokenManager.verify<TokenPayload>(token);
      if (!payload) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }

      const user = await repository.findOne(payload.id);
      if (!user) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
}
