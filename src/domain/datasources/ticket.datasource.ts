import { TicketEntity } from '../entities/ticket.entity';

export abstract class TicketDatasource {
  abstract findOne(id: string): Promise<TicketEntity | null>;
  abstract update(id: string): Promise<TicketEntity | null>;

  abstract getAll(): Promise<TicketEntity[]>;
  abstract getPending(): Promise<TicketEntity[]>;
  abstract getLast(): Promise<TicketEntity | null>;
  abstract getWorkingOn(limit: number): Promise<TicketEntity[]>;
  abstract create(id: string): Promise<TicketEntity>;
  abstract nextPending(desk: string): Promise<TicketEntity | null>;
  abstract getCurrentByDesk(desk: string): Promise<TicketEntity | null>;
  abstract markAsDone(id: string): Promise<TicketEntity | null>;
  abstract countAll(): Promise<number>;
  abstract seed(tickets: TicketEntity[]): Promise<void>;
}
