import { Request, Response } from 'express';

export class TicketController {
  constructor() {}

  public getTickets = async (req: Request, res: Response) => {
    res.json({ ok: true, msg: 'getTickets' });
  };

  public getLastTicket = async (req: Request, res: Response) => {
    res.json({ ok: true, msg: 'getLastTicket' });
  };

  public pendingTickets = async (req: Request, res: Response) => {
    res.json({ ok: true, msg: 'pendingTickets' });
  };

  public createTicket = async (req: Request, res: Response) => {
    res.json({ ok: true, msg: 'createTicket' });
  };

  public drawTicket = async (req: Request, res: Response) => {
    res.json({ ok: true, msg: 'drawTicket' });
  };

  public ticketFinished = async (req: Request, res: Response) => {
    res.json({ ok: true, msg: 'ticketFinished' });
  };

  public workingOn = async (req: Request, res: Response) => {
    res.json({ ok: true, msg: 'workingOn' });
  };
}
