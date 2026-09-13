import { Router } from 'express';
import { TicketService } from '../../../../domain/services/ticket.service';
import { TicketRepositoryImpl } from '../../../../infrastructure/repositories/tickets/ticket.repository.impl';
import { TicketDatasourceImpl } from '../../../../infrastructure/data/postgres/tickets/ticket.datasource.impl';
import { UuidAdapter } from '../../../../infrastructure/adapters/uuid.adapter';
import { TicketController } from './controller';
import { WssNotifier } from '../../../../infrastructure/websocket/wss.notifier';

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
    router.get('/last', controller.getLastTicket);
    router.get('/pending', controller.pendingTickets);

    router.post('/', controller.createTicket);

    router.get('/draw/:desk', controller.drawTicket);
    router.put('/done/:ticketId', controller.ticketFinished);

    router.get('/working-on', controller.workingOn);

    return router;
  }
}
