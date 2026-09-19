import { Router } from 'express';
import { PermissionService } from '../../../../domain/services/permission.service';
import { PermissionRepositoryImpl } from '../../../../infrastructure/repositories/permissions/permission.repository.impl';
import { PermissionDatasourceImpl } from '../../../../infrastructure/data/postgres/permissions/permission.datasource.impl';
import { UserRepositoryImpl } from '../../../../infrastructure/repositories/users/user.repository.impl';
import { UserDatasourceImpl } from '../../../../infrastructure/data/postgres/users/user.datasource.impl';
import { UuidAdapter } from '../../../../infrastructure/adapters/uuid.adapter';
import { JwtAdapter } from '../../../../infrastructure/adapters/jwt.adapter';
import { PermissionController } from './controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAdminMiddleware } from '../middlewares/require-admin.middleware';
import { writeRateLimiterMiddleware } from '../middlewares/rate-limit.middleware';

export class PermissionRoutes {
  static get routes(): Router {
    const router = Router();

    const datasource = new PermissionDatasourceImpl();
    const repository = new PermissionRepositoryImpl(datasource);
    const service = new PermissionService(repository, UuidAdapter);
    const controller = new PermissionController(service);

    const userRepository = new UserRepositoryImpl(new UserDatasourceImpl());
    const requireAuth = authMiddleware(userRepository, JwtAdapter);
    const requireAdmin = requireAdminMiddleware;

    router.get('/', requireAuth, controller.getPermissions);
    router.get('/:permissionId', requireAuth, controller.getPermission);
    router.post(
      '/',
      requireAuth,
      requireAdmin,
      writeRateLimiterMiddleware,
      controller.createPermission,
    );
    router.put(
      '/:permissionId',
      requireAuth,
      requireAdmin,
      writeRateLimiterMiddleware,
      controller.updatePermission,
    );
    router.delete(
      '/:permissionId',
      requireAuth,
      requireAdmin,
      writeRateLimiterMiddleware,
      controller.deletePermission,
    );

    router.get('/:permissionId/roles', requireAuth, controller.getPermissionRoles);

    return router;
  }
}
