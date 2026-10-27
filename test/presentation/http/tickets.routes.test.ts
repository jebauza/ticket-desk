import request from 'supertest';
import express from 'express';
import { TicketRoutes } from '../../../src/presentation/http/api/tickets/routes';
import { errorHandlerMiddleware } from '../../../src/presentation/http/api/middlewares/error-handler.middleware';
import { TicketService } from '../../../src/domain/services/ticket.service';
import { TicketEntity } from '../../../src/domain/entities/ticket.entity';
import { FakeTicketRepository, fixedIdManager, noopNotifier } from '../../helpers/fakes';

function buildApp() {
  const repository = new FakeTicketRepository();
  repository.seed([
    TicketEntity.create({ id: 't1', number: 1, handleAtDesk: 'd1', done: true }),
    TicketEntity.create({ id: 't2', number: 2 }),
    TicketEntity.create({ id: 't3', number: 3 }),
    TicketEntity.create({ id: 't4', number: 4 }),
    TicketEntity.create({ id: 't5', number: 5 }),
  ]);
  const service = new TicketService(repository, fixedIdManager, noopNotifier);

  const app = express();
  app.use(express.json());
  app.use('/api/tickets', TicketRoutes.routes({ service }));
  app.use(errorHandlerMiddleware);
  return app;
}

describe('GET /api/tickets', () => {
  it('pagina por page y filtra por pendientes', async () => {
    const res = await request(buildApp()).get('/api/tickets?status=pending&page=1&limit=2');

    expect(res.status).toBe(200);
    expect(res.body.data.map((t: { number: number }) => t.number)).toEqual([2, 3]);
    expect(res.body.meta).toEqual({
      page: 1,
      limit: 2,
      total: 4,
      totalPages: 2,
      hasNext: true,
      hasPrev: false,
    });
  });

  it('pagina por offset y devuelve meta en estilo offset', async () => {
    const res = await request(buildApp()).get('/api/tickets?offset=1&limit=2');

    expect(res.status).toBe(200);
    expect(res.body.data.map((t: { number: number }) => t.number)).toEqual([2, 3]);
    expect(res.body.meta).toEqual({
      offset: 1,
      limit: 2,
      total: 5,
      hasNext: true,
      hasPrev: true,
    });
    expect(res.body.meta.page).toBeUndefined();
  });

  it('página fuera de rango: data vacío y total correcto', async () => {
    const res = await request(buildApp()).get('/api/tickets?page=999');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta.total).toBe(5);
    expect(res.body.meta.hasNext).toBe(false);
  });

  it.each([
    ['page y offset a la vez', '?page=1&offset=0'],
    ['limit sobre el máximo', '?limit=500'],
    ['status inválido', '?status=foo'],
    ['page no numérico', '?page=abc'],
  ])('400 con %s', async (_name, query) => {
    const res = await request(buildApp()).get(`/api/tickets${query}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
