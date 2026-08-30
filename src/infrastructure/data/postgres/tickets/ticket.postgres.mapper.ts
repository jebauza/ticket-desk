import { TicketEntity } from '../../../../domain/entities/ticket.entity';

interface TicketRow {
  id: string;
  number: number;
  create_at: Date;
  handle_at_desk: string | null;
  handle_at: Date | null;
  done: boolean;
}

export class TicketMapper {
  static fromRow(row: TicketRow): TicketEntity {
    return TicketEntity.fromObject({
      id: row.id,
      number: row.number,
      createAt: row.create_at,
      handleAtDesk: row.handle_at_desk,
      handleAt: row.handle_at,
      done: row.done,
    });
  }
}
