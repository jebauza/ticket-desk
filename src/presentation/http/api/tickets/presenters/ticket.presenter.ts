import { TicketEntity } from '../../../../../domain/entities/ticket.entity';

interface TicketPresenterDto {
  id: string;
  number: number;
  createAt: Date;
  handleAtDesk: string | null;
  handleAt: Date | null;
  done: boolean;
  isPending: boolean;
}

export class TicketPresenter {
  static fromEntity(ticket: TicketEntity): TicketPresenterDto {
    return {
      id: ticket.id,
      number: ticket.number,
      createAt: ticket.createAt,
      handleAtDesk: ticket.handleAtDesk,
      handleAt: ticket.handleAt,
      done: ticket.done,
      isPending: ticket.isPending,
    };
  }

  static fromEntities(tickets: TicketEntity[]): TicketPresenterDto[] {
    return tickets.map(TicketPresenter.fromEntity);
  }
}
