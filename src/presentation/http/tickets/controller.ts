import { NextFunction, Request, Response } from 'express';
import { TicketService } from '../../../domain/services/ticket.service';
import { UuidAdapter } from '../../../infrastructure/adapters/uuid.adapter';

export class TicketController {
  constructor(private readonly service: TicketService = new TicketService(UuidAdapter)) {}

  public getTickets = async (req: Request, res: Response) => {
    res.json(this.service.tickets);
  };

  public getLastTicket = async (req: Request, res: Response) => {
    res.json(this.service.lastTicketNumber);
  };

  public pendingTickets = async (req: Request, res: Response) => {
    res.json(this.service.pendingTickets);
  };

  public createTicket = async (req: Request, res: Response) => {
    res.status(201).json(this.service.createTicket());
  };

  public drawTicket = async (req: Request, res: Response) => {
    const { desk } = req.params;
    if (typeof desk !== 'string') {
      res.status(400).json({ error: 'desk param is required' });
      return;
    }

    res.json(this.service.drawTicket(desk));
  };

  public ticketFinished = async (req: Request, res: Response, next: NextFunction) => {
    const { ticketId } = req.params;
    if (typeof ticketId !== 'string') {
      res.status(400).json({ error: 'ticketId param is required' });
      return;
    }

    try {
      res.json(this.service.onFinishedTicket(ticketId));
    } catch (error) {
      next(error);
    }
  };

  public workingOn = async (req: Request, res: Response) => {
    res.json({ ok: true, msg: 'workingOn' });
  };
}
