import { Router } from 'express';
import { AuthService } from '../../../../domain/services/auth.service';
import { UserRepositoryImpl } from '../../../../infrastructure/repositories/users/user.repository.impl';
import { UserDatasourceImpl } from '../../../../infrastructure/data/postgres/users/user.datasource.impl';
import { UuidAdapter } from '../../../../infrastructure/adapters/uuid.adapter';
import { BcryptAdapter } from '../../../../infrastructure/adapters/bcrypt.adapter';
import { JwtAdapter } from '../../../../infrastructure/adapters/jwt.adapter';
import { AuthController } from './controller';
import { writeRateLimiterMiddleware } from '../middlewares/rate-limit.middleware';

export class AuthRoutes {
  static get routes(): Router {
    const router = Router();

    const datasource = new UserDatasourceImpl();
    const repository = new UserRepositoryImpl(datasource);
    const service = new AuthService(repository, UuidAdapter, BcryptAdapter, JwtAdapter);
    const controller = new AuthController(service);

    router.post('/register', writeRateLimiterMiddleware, controller.register);
    router.post('/login', writeRateLimiterMiddleware, controller.login);

    return router;
  }
}
