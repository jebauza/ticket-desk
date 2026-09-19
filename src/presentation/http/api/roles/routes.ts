import { Router } from 'express';
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

export class RoleRoutes {
  static get routes(): Router {
    const router = Router();

    const datasource = new RoleDatasourceImpl();
    const repository = new RoleRepositoryImpl(datasource);
    const service = new RoleService(repository, UuidAdapter);
    const controller = new RoleController(service);

    // authMiddleware necesita su propio UserRepository para verificar el
    // token — mismo patrón de composition root que auth/routes.ts.
    const userRepository = new UserRepositoryImpl(new UserDatasourceImpl());
    const requireAuth = authMiddleware(userRepository, JwtAdapter);
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
