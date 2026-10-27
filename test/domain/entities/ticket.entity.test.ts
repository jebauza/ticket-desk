import { TicketEntity } from '../../../src/domain/entities/ticket.entity';

describe('TicketEntity.status', () => {
  it('pending: sin desk asignado', () => {
    expect(TicketEntity.create({ id: 'a', number: 1 }).status).toBe('pending');
  });

  it('in-progress: con desk y sin terminar', () => {
    const ticket = TicketEntity.create({ id: 'a', number: 1, handleAtDesk: 'd1' });
    expect(ticket.status).toBe('in-progress');
  });

  it('done: terminado', () => {
    const ticket = TicketEntity.create({ id: 'a', number: 1, handleAtDesk: 'd1', done: true });
    expect(ticket.status).toBe('done');
  });
});
