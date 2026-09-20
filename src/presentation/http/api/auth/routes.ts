import { Router } from 'express';
import { AuthService } from '../../../../domain/services/auth.service';
import { UserRepositoryImpl } from '../../../../infrastructure/repositories/users/user.repository.impl';
import { UserDatasourceImpl } from '../../../../infrastructure/data/postgres/users/user.datasource.impl';
import { UuidAdapter } from '../../../../infrastructure/adapters/uuid.adapter';
import { BcryptAdapter } from '../../../../infrastructure/adapters/bcrypt.adapter';
import { JwtAdapter } from '../../../../infrastructure/adapters/jwt.adapter';
import { AuthController } from './controller';
import { writeRateLimiterMiddleware } from '../middlewares/rate-limit.middleware';

interface AuthRoutesDeps {
  service?: AuthService;
}

export class AuthRoutes {
  static routes(deps: AuthRoutesDeps = {}): Router {
    const router = Router();

    const service =
      deps.service ??
      new AuthService(
        new UserRepositoryImpl(new UserDatasourceImpl()),
        UuidAdapter,
        BcryptAdapter,
        JwtAdapter,
      );
    const controller = new AuthController(service);

    router.post('/register', writeRateLimiterMiddleware, controller.register);
    router.post('/login', writeRateLimiterMiddleware, controller.login);

    return router;
  }
}
