import { Router } from 'express';
import { TicketService } from '../../../../domain/services/ticket.service';
import { TicketRepositoryImpl } from '../../../../infrastructure/repositories/tickets/ticket.repository.impl';
import { TicketDatasourceImpl } from '../../../../infrastructure/data/postgres/tickets/ticket.datasource.impl';
import { UuidAdapter } from '../../../../infrastructure/adapters/uuid.adapter';
import { TicketController } from './controller';
import { WssNotifier } from '../../../../infrastructure/websocket/wss.notifier';
import { writeRateLimiterMiddleware } from '../middlewares/rate-limit.middleware';

interface TicketRoutesDeps {
  service?: TicketService;
}

export class TicketRoutes {
  static routes(deps: TicketRoutesDeps = {}): Router {
    const router = Router();

    const service =
      deps.service ??
      new TicketService(
        new TicketRepositoryImpl(new TicketDatasourceImpl()),
        UuidAdapter,
        new WssNotifier(),
      );
    const controller = new TicketController(service);

    router.get('/', controller.getTickets);
    router.post('/', writeRateLimiterMiddleware, controller.createTicket);

    router.get('/last', controller.getLastTicket);
    router.get('/pending', controller.pendingTickets);
    router.get('/working-on', controller.workingOn);

    router.get('/desk/current', controller.currentByDesk);
    router.post(
      '/desk/next-ticket',
      writeRateLimiterMiddleware,
      controller.nextTicket,
    );

    router.put(
      '/done/:ticketId',
      writeRateLimiterMiddleware,
      controller.ticketFinished,
    );

    // Rutas genéricas por :ticketId al final: deben ir después de cualquier
    // ruta con segmento fijo (/last, /desk/*, /done/*) para que Express no
    // las intercepte como si fueran un id.
    router.get('/:ticketId', controller.getTicket);
    router.put(
      '/:ticketId',
      writeRateLimiterMiddleware,
      controller.updateTicket,
    );
    router.delete(
      '/:ticketId',
      writeRateLimiterMiddleware,
      controller.deleteTicket,
    );

    return router;
  }
}
