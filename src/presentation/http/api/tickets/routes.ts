import { Router } from 'express';
import { TicketService } from '../../../../domain/services/ticket.service';
import { TicketRepositoryImpl } from '../../../../infrastructure/repositories/tickets/ticket.repository.impl';
import { TicketDatasourceImpl } from '../../../../infrastructure/data/postgres/tickets/ticket.datasource.impl';
import { UuidAdapter } from '../../../../infrastructure/adapters/uuid.adapter';
import { TicketController } from './controller';
import { WssNotifier } from '../../../../infrastructure/websocket/wss.notifier';
import { writeRateLimiterMiddleware } from '../middlewares/rate-limit.middleware';

export class TicketRoutes {
  static get routes(): Router {
    const router = Router();

    const datasource = new TicketDatasourceImpl();
    const repository = new TicketRepositoryImpl(datasource);
    const service = new TicketService(
      repository,
      UuidAdapter,
      new WssNotifier(),
    );
    const controller = new TicketController(service);

    router.get('/', controller.getTickets);
    router.post('/', writeRateLimiterMiddleware, controller.createTicket);

    router.get('/last', controller.getLastTicket);
    router.get('/pending', controller.pendingTickets);
    router.get('/working-on', controller.workingOn);

    router.put(
      '/done/:ticketId',
      writeRateLimiterMiddleware,
      controller.ticketFinished,
    );

    router.get('/desk/current', controller.currentByDesk);
    router.post(
      '/desk/next-ticket',
      writeRateLimiterMiddleware,
      controller.nextTicket,
    );

    return router;
  }
}
