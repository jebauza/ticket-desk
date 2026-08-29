import { Ticket } from '../interfaces/ticket';
import { CustomError } from '../errors/custom.error';
import { IdManager } from '../interfaces/id-manager';

export class TicketService {
  public readonly tickets: Ticket[];

  constructor(private readonly idGenerator: IdManager) {
    this.tickets = [1, 2, 3, 4, 5, 6].map((number) => ({
      id: this.idGenerator.generate(),
      number,
      createAt: new Date(),
      done: false,
    }));
  }

  private readonly workingOnTickets: Ticket[] = [];

  public get pendingTickets(): Ticket[] {
    return this.tickets.filter((ticket) => !ticket.handleAtDesk);
  }

  public get lastTicketNumber(): number {
    return this.tickets.length > 0
      ? this.tickets[this.tickets.length - 1]!.number
      : 0;
  }

  public get last4WorkingOnTickets(): Ticket[] {
    return this.workingOnTickets.slice(0, 4);
  }

  public createTicket(): Ticket {
    const ticket: Ticket = {
      id: this.idGenerator.generate(),
      number: this.lastTicketNumber + 1,
      createAt: new Date(),
      done: false,
    };

    this.tickets.push(ticket);
    // TODO WS

    return ticket;
  }

  public drawTicket(desk: string) {
    const ticket = this.pendingTickets[0];
    if (!ticket) return { ok: false, msg: 'No hay tickets pendientes' };

    ticket.handleAtDesk = desk;
    ticket.handleAt = new Date();

    this.workingOnTickets.unshift({ ...ticket });

    // TODO WS

    return { ok: true, ticket };
  }

  public onFinishedTicket(id: string) {
    if (!this.idGenerator.isValid(id))
      throw CustomError.badRequest('Id is not a valid uuid');
    let ticket = null;

    this.tickets.map((t) => {
      if (t.id === id) {
        t.done = true;
        ticket = t;
      }

      return t;
    });

    if (!ticket) throw CustomError.notFound('Ticket not found');

    return { ok: true };
  }
}
