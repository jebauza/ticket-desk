import { TicketEntity } from '../../../../domain/entities/ticket.entity';

// Shape asumido de la respuesta JSON de la API externa. Ajustar al contrato
// real una vez que exista una API concreta que integrar.
export interface TicketApiResponse {
  id: string;
  number: number;
  createAt: string;
  handleAtDesk?: string;
  handleAt?: string;
  done: boolean;
}

export class TicketApiMapper {
  static fromResponse(row: TicketApiResponse): TicketEntity {
    return TicketEntity.fromObject(row);
  }
}
