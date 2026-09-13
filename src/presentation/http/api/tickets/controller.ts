import { NextFunction, Request, Response } from 'express';
import { TicketService } from '../../../../domain/services/ticket.service';
import { TicketPresenter } from './presenters/ticket.presenter';
import { ApiResponse } from '../shared/api-response';

export class TicketController {
  constructor(private readonly service: TicketService) {}

  public getTickets = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const tickets = await this.service.getTickets();
      res.json(TicketPresenter.fromEntities(tickets));
    } catch (error) {
      next(error);
    }
  };

  public getLastTicket = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const ticket = await this.service.getLastTicket();
      res
        .status(200)
        .json(ApiResponse.success(TicketPresenter.fromEntity(ticket)));
    } catch (error) {
      next(error);
    }
  };

  public pendingTickets = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const tickets = await this.service.getPendingTickets();
      res.json(ApiResponse.success(TicketPresenter.fromEntities(tickets)));
    } catch (error) {
      next(error);
    }
  };

  public createTicket = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const ticket = await this.service.createTicket();
      res.status(201).json(TicketPresenter.fromEntity(ticket));
    } catch (error) {
      next(error);
    }
  };

  public workingByDesk = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { desk } = req.query;
    if (typeof desk !== 'string') {
      res.status(400).json({ error: 'desk param is required' });
      return;
    }

    try {
      const ticket = await this.service.workingByDesk(desk);
      res.json(
        ApiResponse.success(ticket ? TicketPresenter.fromEntity(ticket) : null),
      );
    } catch (error) {
      next(error);
    }
  };

  public drawTicket = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { desk } = req.params;
    if (typeof desk !== 'string') {
      res.status(400).json({ error: 'desk param is required' });
      return;
    }

    try {
      const ticket = await this.service.drawTicket(desk);
      res.json(
        ApiResponse.success(ticket ? TicketPresenter.fromEntity(ticket) : null),
      );
    } catch (error) {
      next(error);
    }
  };

  public ticketFinished = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { ticketId } = req.params;
    if (typeof ticketId !== 'string') {
      res.status(400).json({ error: 'ticketId param is required' });
      return;
    }

    try {
      res.json(await this.service.onFinishedTicket(ticketId));
    } catch (error) {
      next(error);
    }
  };

  public workingOn = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const tickets = await this.service.getLast4WorkingOnTickets();
      res.json(TicketPresenter.fromEntities(tickets));
    } catch (error) {
      next(error);
    }
  };
}
