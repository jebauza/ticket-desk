import { TICKET_STATUSES, TicketStatus } from '../../../entities/ticket.entity';

export class TicketFiltersDto {
  private constructor(public readonly status: TicketStatus | undefined) {}

  static create(query: {
    status?: unknown;
  }): [string | undefined, TicketFiltersDto | undefined] {
    const { status } = query;

    if (status === undefined) return [undefined, new TicketFiltersDto(undefined)];

    if (typeof status !== 'string' || !TICKET_STATUSES.includes(status as TicketStatus)) {
      return [`status must be one of: ${TICKET_STATUSES.join(', ')}`, undefined];
    }

    return [undefined, new TicketFiltersDto(status as TicketStatus)];
  }
}
