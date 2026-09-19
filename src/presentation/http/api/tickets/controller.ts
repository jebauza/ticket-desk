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
      res.json(ApiResponse.success(TicketPresenter.fromEntities(tickets)));
    } catch (error) {
      next(error);
    }
  };

  public getTicket = async (req: Request, res: Response, next: NextFunction) => {
    const { ticketId } = req.params;
    if (typeof ticketId !== 'string')
      return res.status(400).json({ error: 'ticketId param is required' });

    try {
      const ticket = await this.service.findById(ticketId);
      res.json(ApiResponse.success(TicketPresenter.fromEntity(ticket)));
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
      res.status(201).json(ApiResponse.success(TicketPresenter.fromEntity(ticket)));
    } catch (error) {
      next(error);
    }
  };

  public currentByDesk = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { desk } = req.query;
    if (typeof desk !== 'string') {
      return res.status(400).json({ error: 'desk param is required' });
    }

    try {
      const ticket = await this.service.currentByDesk(desk);
      res.json(
        ApiResponse.success(ticket ? TicketPresenter.fromEntity(ticket) : {}),
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
    if (typeof ticketId !== 'string')
      return res.status(400).json({ error: 'ticketId param is required' });

    const { desk } = req.body;
    if (typeof desk !== 'string')
      return res.status(400).json({ error: 'desk field is required' });

    try {
      const ticket = await this.service.onFinishedTicket(ticketId, desk);
      res.json(ApiResponse.success(TicketPresenter.fromEntity(ticket)));
    } catch (error) {
      next(error);
    }
  };

  public nextTicket = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { desk } = req.body;
    if (typeof desk !== 'string') {
      res.status(400).json({ error: 'desk field is required' });
      return;
    }

    try {
      const ticket = await this.service.nextTicket(desk);
      res.json(
        ApiResponse.success(ticket ? TicketPresenter.fromEntity(ticket) : {}),
      );
    } catch (error) {
      next(error);
    }
  };

  public updateTicket = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { ticketId } = req.params;
    if (typeof ticketId !== 'string')
      return res.status(400).json({ error: 'ticketId param is required' });

    try {
      const ticket = await this.service.updateTicket(ticketId, req.body);
      res.json(ApiResponse.success(TicketPresenter.fromEntity(ticket)));
    } catch (error) {
      next(error);
    }
  };

  public deleteTicket = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { ticketId } = req.params;
    if (typeof ticketId !== 'string')
      return res.status(400).json({ error: 'ticketId param is required' });

    try {
      res.json(ApiResponse.success(await this.service.deleteTicket(ticketId)));
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
      res.json(ApiResponse.success(TicketPresenter.fromEntities(tickets)));
    } catch (error) {
      next(error);
    }
  };
}
