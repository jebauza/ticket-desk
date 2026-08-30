import { TicketEntity } from '../../../../domain/entities/ticket.entity';

export interface TicketDocument {
  _id: string;
  number: number;
  createAt: Date;
  handleAtDesk: string | null;
  handleAt: Date | null;
  done: boolean;
}

export class TicketMongoMapper {
  static fromDocument(doc: TicketDocument): TicketEntity {
    return TicketEntity.fromObject({
      id: doc._id,
      number: doc.number,
      createAt: doc.createAt,
      handleAtDesk: doc.handleAtDesk,
      handleAt: doc.handleAt,
      done: doc.done,
    });
  }
}
