import { TicketService } from '../../../src/domain/services/ticket.service';
import { TicketEntity } from '../../../src/domain/entities/ticket.entity';
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
