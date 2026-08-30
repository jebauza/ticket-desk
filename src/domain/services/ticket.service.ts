import { TicketEntity } from '../entities/ticket.entity';
import { CustomError } from '../errors/custom.error';
import { IdManager } from '../interfaces/id-manager';
import { TicketRepository } from '../repositories/ticket.repository';

export class TicketService {
  constructor(
    private readonly repository: TicketRepository,
    private readonly idManager: IdManager,
  ) {}

  public async seedTickets(): Promise<void> {
    const count = await this.repository.countAll();
    if (count > 0) return;

    const tickets: TicketEntity[] = [1, 2, 3, 4, 5, 6].map((number) =>
      TicketEntity.fromObject({
        id: this.idManager.generate(),
        number,
        createAt: new Date(),
        done: false,
      }),
    );

    await this.repository.seed(tickets);
  }

  public getTickets(): Promise<TicketEntity[]> {
    return this.repository.getAll();
  }

  public getPendingTickets(): Promise<TicketEntity[]> {
    return this.repository.getPending();
  }

  public getLastTicketNumber(): Promise<number> {
    return this.repository.getLastNumber();
  }

  public getLast4WorkingOnTickets(): Promise<TicketEntity[]> {
    return this.repository.getWorkingOn(4);
  }

  public async createTicket(): Promise<TicketEntity> {
    const ticket = await this.repository.create(this.idManager.generate());
    // TODO WS

    return ticket;
  }

  public async drawTicket(desk: string) {
    const ticket = await this.repository.drawNext(desk);
    if (!ticket) return { ok: false, msg: 'No hay tickets pendientes' };

    // TODO WS

    return { ok: true, ticket };
  }

  public async onFinishedTicket(id: string) {
    if (!this.idManager.isValid(id))
      throw CustomError.badRequest('Id is not a valid uuid');

    const ticket = await this.repository.markAsDone(id);
    if (!ticket) throw CustomError.notFound('Ticket not found');

    return { ok: true };
  }
}
