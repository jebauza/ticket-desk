import { Router, RequestHandler } from 'express';
import { UserService } from '../../../../domain/services/user.service';
import { UserRepositoryImpl } from '../../../../infrastructure/repositories/users/user.repository.impl';
import { UserDatasourceImpl } from '../../../../infrastructure/data/postgres/users/user.datasource.impl';
import { UuidAdapter } from '../../../../infrastructure/adapters/uuid.adapter';
import { BcryptAdapter } from '../../../../infrastructure/adapters/bcrypt.adapter';
import { JwtAdapter } from '../../../../infrastructure/adapters/jwt.adapter';
import { UserController } from './controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAdminMiddleware } from '../middlewares/require-admin.middleware';
import { writeRateLimiterMiddleware } from '../middlewares/rate-limit.middleware';

interface UserRoutesDeps {
  service?: UserService;
  requireAuth?: RequestHandler;
}

export class UserRoutes {
  static routes(deps: UserRoutesDeps = {}): Router {
    const router = Router();

    const datasource = new UserDatasourceImpl();
    const repository = new UserRepositoryImpl(datasource);
    const service = deps.service ?? new UserService(repository, UuidAdapter, BcryptAdapter);
    const controller = new UserController(service);

    const requireAuth = deps.requireAuth ?? authMiddleware(repository, JwtAdapter);

    // La creación queda pública (alta de usuario sin sesión previa); el
    // resto de operaciones exige un token válido.
    router.post('/', writeRateLimiterMiddleware, controller.createUser);

    router.get('/', requireAuth, controller.getUsers);
    router.get('/:userId', requireAuth, controller.getUser);
    router.put('/:userId', requireAuth, writeRateLimiterMiddleware, controller.updateUser);
    router.delete('/:userId', requireAuth, writeRateLimiterMiddleware, controller.deleteUser);

    // Asociación M:N con Role: endpoint aparte, no viaja con el usuario "plano".
    router.get('/:userId/roles', requireAuth, controller.getUserRoles);
    router.put(
      '/:userId/roles',
      requireAuth,
      requireAdminMiddleware,
      writeRateLimiterMiddleware,
      controller.setUserRoles,
    );

    return router;
  }
}
