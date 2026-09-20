import { Router, RequestHandler } from 'express';
import { RoleService } from '../../../../domain/services/role.service';
import { RoleRepositoryImpl } from '../../../../infrastructure/repositories/roles/role.repository.impl';
import { RoleDatasourceImpl } from '../../../../infrastructure/data/postgres/roles/role.datasource.impl';
import { UserRepositoryImpl } from '../../../../infrastructure/repositories/users/user.repository.impl';
import { UserDatasourceImpl } from '../../../../infrastructure/data/postgres/users/user.datasource.impl';
import { UuidAdapter } from '../../../../infrastructure/adapters/uuid.adapter';
import { JwtAdapter } from '../../../../infrastructure/adapters/jwt.adapter';
import { RoleController } from './controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAdminMiddleware } from '../middlewares/require-admin.middleware';
import { writeRateLimiterMiddleware } from '../middlewares/rate-limit.middleware';

interface RoleRoutesDeps {
  service?: RoleService;
  requireAuth?: RequestHandler;
}

export class RoleRoutes {
  static routes(deps: RoleRoutesDeps = {}): Router {
    const router = Router();

    const datasource = new RoleDatasourceImpl();
    const repository = new RoleRepositoryImpl(datasource);
    const service = deps.service ?? new RoleService(repository, UuidAdapter);
    const controller = new RoleController(service);

    const requireAuth =
      deps.requireAuth ??
      authMiddleware(new UserRepositoryImpl(new UserDatasourceImpl()), JwtAdapter);
    const requireAdmin = requireAdminMiddleware;

    router.get('/', requireAuth, controller.getRoles);
    router.get('/:roleId', requireAuth, controller.getRole);
    router.post('/', requireAuth, requireAdmin, writeRateLimiterMiddleware, controller.createRole);
    router.put(
      '/:roleId',
      requireAuth,
      requireAdmin,
      writeRateLimiterMiddleware,
      controller.updateRole,
    );
    router.delete(
      '/:roleId',
      requireAuth,
      requireAdmin,
      writeRateLimiterMiddleware,
      controller.deleteRole,
    );

    router.get('/:roleId/permissions', requireAuth, controller.getRolePermissions);
    router.put(
      '/:roleId/permissions',
      requireAuth,
      requireAdmin,
      writeRateLimiterMiddleware,
      controller.setRolePermissions,
    );

    // Lectura inversa: qué usuarios tienen este rol.
    router.get('/:roleId/users', requireAuth, controller.getRoleUsers);

    return router;
  }
}
