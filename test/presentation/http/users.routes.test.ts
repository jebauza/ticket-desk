import request from 'supertest';
import express from 'express';
import { UserRoutes } from '../../../src/presentation/http/api/users/routes';
import { errorHandlerMiddleware } from '../../../src/presentation/http/api/middlewares/error-handler.middleware';
import { authMiddleware } from '../../../src/presentation/http/api/middlewares/auth.middleware';
import { UserService } from '../../../src/domain/services/user.service';
import { UserEntity } from '../../../src/domain/entities/user.entity';
import { FakeUserRepository, fixedIdManager, plainPasswordHasher } from '../../helpers/fakes';
import { TokenManager } from '../../../src/domain/interfaces/token-manager';

const fakeTokenManagerWithFixedPayload: TokenManager = {
  generate: async () => 'token',
  verify: async <T>() => ({ id: 'authenticated-user' } as T),
};

function buildApp(repository: FakeUserRepository) {
  const service = new UserService(repository, fixedIdManager, plainPasswordHasher);
  const requireAuth = authMiddleware(repository, fakeTokenManagerWithFixedPayload);

  const app = express();
  app.use(express.json());
  app.use('/api/users', UserRoutes.routes({ service, requireAuth }));
  app.use(errorHandlerMiddleware);
  return app;
}

describe('GET /api/users', () => {
  it('devuelve 401 sin token', async () => {
    const app = buildApp(new FakeUserRepository());
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  it('devuelve 200 con token válido', async () => {
    const repository = new FakeUserRepository();
    repository.seed([
      UserEntity.create({
        id: 'authenticated-user',
        name: 'Ana',
        email: 'ana@test.com',
        password: 'hashed',
      }),
    ]);
    const app = buildApp(repository);

    const res = await request(app).get('/api/users').set('Authorization', 'Bearer any-token');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('el usuario autenticado inexistente en BD da 401 (recarga desde repositorio)', async () => {
    // Repositorio vacío: el id del payload no corresponde a ningún usuario real.
    const app = buildApp(new FakeUserRepository());
    const res = await request(app).get('/api/users').set('Authorization', 'Bearer any-token');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/users', () => {
  it('devuelve 400 con body inválido', async () => {
    const app = buildApp(new FakeUserRepository());
    const res = await request(app).post('/api/users').send({ email: 'ana@test.com' });
    expect(res.status).toBe(400);
  });

  it('devuelve 201 en el caso feliz, sin password en la respuesta', async () => {
    const app = buildApp(new FakeUserRepository());
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Ana', email: 'ana@test.com', password: 'secret123' });

    expect(res.status).toBe(201);
    expect(res.body.data).not.toHaveProperty('password');
  });
});
