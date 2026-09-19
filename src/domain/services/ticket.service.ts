import { TicketEntity, TicketUpdateProps } from '../entities/ticket.entity';
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

  public async findById(id: string): Promise<TicketEntity> {
    const ticket = await this.repository.findOne(id);
    if (!ticket) throw CustomError.notFound(`Id (${id}) not found`);

    return ticket;
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

  public async currentByDesk(desk: string): Promise<TicketEntity | null> {
    return await this.repository.getCurrentByDesk(desk);
  }

  public async nextTicket(desk: string): Promise<TicketEntity | null> {
    const ticket =
      (await this.repository.getCurrentByDesk(desk)) ||
      (await this.repository.nextPending(desk));

    this.onTicketNumberChanged();

    return ticket;
  }

  public async getCurrentTicketByDesk(
    desk: string,
  ): Promise<TicketEntity | null> {
    return await this.repository.getCurrentByDesk(desk);
  }

  public async onFinishedTicket(id: string, desk: string) {
    if (!this.idManager.isValid(id))
      throw CustomError.badRequest('Ticket id is not a valid uuid');

    const ticket = await this.findById(id);
    if (ticket.handleAtDesk != desk)
      throw CustomError.badRequest(
        `Ticket was handled by another desk ${ticket.handleAtDesk}`,
      );
    ticket.done = true;

    const updated = await this.repository.update(ticket.id, ticket);
    if (!updated) throw CustomError.notFound('Ticket not found');

    return updated;
  }

  public async updateTicket(
    id: string,
    changes: TicketUpdateProps,
  ): Promise<TicketEntity> {
    if (!this.idManager.isValid(id))
      throw CustomError.badRequest('Ticket id is not a valid uuid');

    const current = await this.findById(id);

    // Merge del patch parcial contra la entidad actual: hacia abajo (repo/datasource)
    // siempre viaja una TicketEntity completa y válida, nunca un objeto parcial.
    const updated = TicketEntity.create({
      id: current.id,
      number: changes.number ?? current.number,
      createAt: changes.createAt ?? current.createAt,
      handleAtDesk:
        changes.handleAtDesk !== undefined
          ? changes.handleAtDesk
          : current.handleAtDesk,
      handleAt:
        changes.handleAt !== undefined ? changes.handleAt : current.handleAt,
      done: changes.done ?? current.done,
    });

    const ticket = await this.repository.update(id, updated);
    if (!ticket) throw CustomError.notFound(`Id (${id}) not found`);

    return ticket;
  }

  public async deleteTicket(id: string): Promise<{ ok: true }> {
    if (!this.idManager.isValid(id))
      throw CustomError.badRequest('Ticket id is not a valid uuid');

    const deleted = await this.repository.delete(id);
    if (!deleted) throw CustomError.notFound(`Id (${id}) not found`);

    return { ok: true };
  }

  private async onTicketNumberChanged() {
    const count = (await this.repository.getPending()).length;
    this.notifier.emit('on-ticket-number-changed', count);
  }
}
