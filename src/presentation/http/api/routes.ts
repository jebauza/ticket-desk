import { Router } from 'express';
import { TicketRoutes } from './tickets/routes';
import { UserRoutes } from './users/routes';
import { AuthRoutes } from './auth/routes';
import { RoleRoutes } from './roles/routes';
import { PermissionRoutes } from './permissions/routes';
import { noStoreMiddleware } from './middlewares/no-store.middleware';

export class ApiRoutes {
  static get routes(): Router {
    const router = Router();

    router.use(noStoreMiddleware);

    router.use('/api/tickets', TicketRoutes.routes());

    router.use('/api/users', UserRoutes.routes());
    router.use('/api/auth', AuthRoutes.routes());

    // RBAC granular (M:N): Role y Permission son agregados independientes.
    router.use('/api/roles', RoleRoutes.routes());
    router.use('/api/permissions', PermissionRoutes.routes());

    return router;
  }
}
