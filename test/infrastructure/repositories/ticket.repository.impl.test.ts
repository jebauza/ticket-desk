import { TicketRepositoryImpl } from '../../../src/infrastructure/repositories/tickets/ticket.repository.impl';
import { TicketDatasource } from '../../../src/domain/datasources/ticket.datasource';
import { TicketEntity } from '../../../src/domain/entities/ticket.entity';

class FakeDatasource extends TicketDatasource {
  getAllCalls = 0;
  private tickets: TicketEntity[] = [];

  async findOne(id: string) {
    return this.tickets.find((t) => t.id === id) ?? null;
  }
  async getAll() {
    this.getAllCalls++;
    return this.tickets;
  }
  async create(id: string) {
    const ticket = TicketEntity.create({ id, number: this.tickets.length + 1 });
    this.tickets.push(ticket);
    return ticket;
  }
  async update(id: string, data: TicketEntity) {
    const index = this.tickets.findIndex((t) => t.id === id);
    if (index === -1) return null;
    this.tickets[index] = data;
    return data;
  }
  async delete(id: string) {
    const before = this.tickets.length;
    this.tickets = this.tickets.filter((t) => t.id !== id);
    return this.tickets.length < before;
  }
  async getPending() {
    return this.tickets.filter((t) => t.isPending);
  }
  async getLast() {
    return this.tickets[this.tickets.length - 1] ?? null;
  }
  async getWorkingOn(limit: number) {
    return this.tickets.slice(0, limit);
  }
  async nextPending() {
    return this.tickets.find((t) => t.isPending) ?? null;
  }
  async getCurrentByDesk(desk: string) {
    return this.tickets.find((t) => t.handleAtDesk === desk) ?? null;
  }
  async markAsDone(id: string) {
    const ticket = await this.findOne(id);
    if (ticket) ticket.done = true;
    return ticket;
  }
  async countAll() {
    return this.tickets.length;
  }
  async seed(tickets: TicketEntity[]) {
    this.tickets = tickets;
  }
}

describe('TicketRepositoryImpl caching', () => {
  it('no vuelve a llamar al datasource si getAll ya cacheó', async () => {
    const datasource = new FakeDatasource();
    const repo = new TicketRepositoryImpl(datasource);

    await repo.getAll();
    await repo.getAll();

    expect(datasource.getAllCalls).toBe(1);
  });

  it('invalida la caché al crear un ticket', async () => {
    const datasource = new FakeDatasource();
    const repo = new TicketRepositoryImpl(datasource);

    await repo.getAll();
    await repo.create('new-id');
    await repo.getAll();

    expect(datasource.getAllCalls).toBe(2);
  });

  it('no invalida la caché en una lectura', async () => {
    const datasource = new FakeDatasource();
    const repo = new TicketRepositoryImpl(datasource);

    await repo.getAll();
    await repo.findOne('does-not-exist');
    await repo.getAll();

    expect(datasource.getAllCalls).toBe(1);
  });
});
