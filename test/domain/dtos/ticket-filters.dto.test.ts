import { TicketFiltersDto } from '../../../src/domain/dtos/tickets/request/ticket-filters.dto';

describe('TicketFiltersDto', () => {
  it('sin status no filtra', () => {
    const [error, dto] = TicketFiltersDto.create({});

    expect(error).toBeUndefined();
    expect(dto!.status).toBeUndefined();
  });

  it.each(['pending', 'in-progress', 'done'])('acepta status %s', (status) => {
    const [error, dto] = TicketFiltersDto.create({ status });

    expect(error).toBeUndefined();
    expect(dto!.status).toBe(status);
  });

  it.each(['foo', '', ['pending', 'done'], 1])('rechaza status %j', (status) => {
    const [error, dto] = TicketFiltersDto.create({ status });

    expect(error).toBeDefined();
    expect(dto).toBeUndefined();
  });
});
