import { TicketService } from '../../../src/domain/services/ticket.service';
import { TicketEntity } from '../../../src/domain/entities/ticket.entity';
import { PaginationDto } from '../../../src/domain/dtos/shared/pagination.dto';
import { TicketFiltersDto } from '../../../src/domain/dtos/tickets/request/ticket-filters.dto';
import { FakeTicketRepository, fixedIdManager, noopNotifier } from '../../helpers/fakes';

function buildService() {
  const repository = new FakeTicketRepository();
  const service = new TicketService(repository, fixedIdManager, noopNotifier);
  return { repository, service };
}

describe('TicketService.updateTicket', () => {
  it('conserva los campos no enviados en un patch parcial', async () => {
    const { repository, service } = buildService();
    const existing = TicketEntity.create({
      id: 'ticket-1',
      number: 5,
      handleAtDesk: 'desk-1',
      done: false,
    });
    repository.seed([existing]);

    const updated = await service.updateTicket('ticket-1', { done: true });

    expect(updated.number).toBe(5);
    expect(updated.handleAtDesk).toBe('desk-1');
    expect(updated.done).toBe(true);
  });
});

describe('TicketService.getTickets', () => {
  function seeded() {
    const { repository, service } = buildService();
    repository.seed([
      TicketEntity.create({ id: 't1', number: 1, handleAtDesk: 'd1', done: true }),
      TicketEntity.create({ id: 't2', number: 2 }),
      TicketEntity.create({ id: 't3', number: 3 }),
      TicketEntity.create({ id: 't4', number: 4 }),
    ]);
    return service;
  }

  it('filtra por pendientes y pagina sobre el resultado filtrado', async () => {
    const service = seeded();
    const [, filters] = TicketFiltersDto.create({ status: 'pending' });
    const [, pagination] = PaginationDto.fromPage(1, 2);

    const result = await service.getTickets(filters!, pagination!);

    expect(result.items.map((t) => t.number)).toEqual([2, 3]);
    expect(result.total).toBe(3);
    expect(result.hasNext).toBe(true);
  });

  it('sin filtro devuelve todos; en modo offset arranca donde se pide', async () => {
    const service = seeded();
    const [, filters] = TicketFiltersDto.create({});
    const [, pagination] = PaginationDto.fromOffset(3, 2);

    const result = await service.getTickets(filters!, pagination!);

    expect(result.items.map((t) => t.number)).toEqual([4]);
    expect(result.total).toBe(4);
    expect(result.hasNext).toBe(false);
  });
});
