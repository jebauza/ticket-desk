import { TicketEntity } from '../entities/ticket.entity';
import { PaginationDto } from '../dtos/shared/pagination.dto';
import { PaginatedResult } from '../dtos/shared/paginated-result.dto';
import { TicketFiltersDto } from '../dtos/tickets/request/ticket-filters.dto';

export abstract class TicketRepository {
  abstract findOne(id: string): Promise<TicketEntity | null>;
  abstract getAll(): Promise<TicketEntity[]>;
  abstract findPaginated(
    filters: TicketFiltersDto,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<TicketEntity>>;
  abstract create(id: string): Promise<TicketEntity>;
  abstract update(id: string, data: TicketEntity): Promise<TicketEntity | null>;
  abstract delete(id: string): Promise<boolean>;

  abstract getPending(): Promise<TicketEntity[]>;
  abstract getLast(): Promise<TicketEntity | null>;
  abstract getWorkingOn(limit: number): Promise<TicketEntity[]>;
  abstract nextPending(desk: string): Promise<TicketEntity | null>;
  abstract getCurrentByDesk(desk: string): Promise<TicketEntity | null>;
  abstract markAsDone(id: string): Promise<TicketEntity | null>;
  abstract countAll(): Promise<number>;
  abstract seed(tickets: TicketEntity[]): Promise<void>;
}
