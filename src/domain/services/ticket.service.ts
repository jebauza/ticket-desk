import { TicketEntity } from '../entities/ticket.entity';
import { CustomError } from '../errors/custom.error';
import { IdManager } from '../interfaces/id-manager';
import { RealtimeNotifier } from '../interfaces/realtime-notifier';
import { TicketRepository } from '../repositories/ticket.repository';

export class TicketService {
  constructor(
    private readonly repository: TicketRepository,
    private readonly idManager: IdManager,
    private readonly notifier: RealtimeNotifier,
  ) {}

  public async seedTickets(): Promise<void> {
    const count = await this.repository.countAll();
    if (count > 0) return;

    const tickets: TicketEntity[] = [1, 2, 3, 4, 5, 6].map((number) =>
      TicketEntity.create({
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

  public async getLastTicket(): Promise<TicketEntity> {
    const ticket = await this.repository.getLast();
    if (!ticket) throw CustomError.notFound('No tickets found');

    return ticket;
  }

  public getLast4WorkingOnTickets(): Promise<TicketEntity[]> {
    return this.repository.getWorkingOn(4);
  }

  public async createTicket(): Promise<TicketEntity> {
    const ticket = await this.repository.create(this.idManager.generate());
    this.onTicketNumberChanged();

    return ticket;
  }

  public async workingByDesk(desk: string): Promise<TicketEntity | null> {
    return await this.repository.getCurrentByDesk(desk);
  }

  public async drawTicket(desk: string): Promise<TicketEntity | null> {
    const ticket =
      (await this.repository.getCurrentByDesk(desk)) ||
      (await this.repository.drawNext(desk));

    // this.notifier.emit('ticket:drawn', { ticket, desk });

    return ticket;
  }

  public async getCurrentTicketByDesk(
    desk: string,
  ): Promise<TicketEntity | null> {
    return await this.repository.getCurrentByDesk(desk);
  }

  public async onFinishedTicket(id: string) {
    if (!this.idManager.isValid(id))
      throw CustomError.badRequest('Id is not a valid uuid');

    const ticket = await this.repository.markAsDone(id);
    if (!ticket) throw CustomError.notFound('Ticket not found');

    return { ok: true };
  }

  private async onTicketNumberChanged() {
    const count = (await this.repository.getPending()).length;
    this.notifier.emit('on-ticket-number-changed', count);
  }
}
