import { TicketEntity } from '../entities/ticket.entity';

export abstract class TicketDatasource {
  // --- CRUD base (equivalente a findUnique/findMany/create/update/delete de Prisma,
  // findOne/find/save/update/remove de TypeORM, findByPk/findAll/create/update/destroy de Sequelize) ---
  abstract findOne(id: string): Promise<TicketEntity | null>;
  abstract getAll(): Promise<TicketEntity[]>;
  abstract create(id: string): Promise<TicketEntity>;
  abstract update(id: string, data: TicketEntity): Promise<TicketEntity | null>;
  abstract delete(id: string): Promise<boolean>;

  // --- Consultas y mutaciones específicas del dominio de tickets ---
  abstract getPending(): Promise<TicketEntity[]>;
  abstract getLast(): Promise<TicketEntity | null>;
  abstract getWorkingOn(limit: number): Promise<TicketEntity[]>;
  abstract nextPending(desk: string): Promise<TicketEntity | null>;
  abstract getCurrentByDesk(desk: string): Promise<TicketEntity | null>;
  abstract markAsDone(id: string): Promise<TicketEntity | null>;
  abstract countAll(): Promise<number>;
  abstract seed(tickets: TicketEntity[]): Promise<void>;
}
