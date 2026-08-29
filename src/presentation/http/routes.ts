import { Router } from 'express';
import { TicketRoutes } from './tickets/routes';

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    // Ticket
    router.use('/api/tickets', TicketRoutes.routes);

    return router;
  }
}
