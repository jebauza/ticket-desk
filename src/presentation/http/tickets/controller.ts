import { NextFunction, Request, Response } from 'express';
import { TicketService } from '../../../domain/services/ticket.service';

export class TicketController {
  constructor(private readonly service: TicketService) {}

  public getTickets = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this.service.getTickets());
    } catch (error) {
      next(error);
    }
  };

  public getLastTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this.service.getLastTicketNumber());
    } catch (error) {
      next(error);
    }
  };

  public pendingTickets = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this.service.getPendingTickets());
    } catch (error) {
      next(error);
    }
  };

  public createTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(await this.service.createTicket());
    } catch (error) {
      next(error);
    }
  };

  public drawTicket = async (req: Request, res: Response, next: NextFunction) => {
    const { desk } = req.params;
    if (typeof desk !== 'string') {
      res.status(400).json({ error: 'desk param is required' });
      return;
    }

    try {
      res.json(await this.service.drawTicket(desk));
    } catch (error) {
      next(error);
    }
  };

  public ticketFinished = async (req: Request, res: Response, next: NextFunction) => {
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

  public workingOn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this.service.getLast4WorkingOnTickets());
    } catch (error) {
      next(error);
    }
  };
}
