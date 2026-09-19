import { TicketEntity } from '../../../domain/entities/ticket.entity';
import { CustomError } from '../../../domain/errors/custom.error';
import { TicketDatasource } from '../../../domain/datasources/ticket.datasource';
import { TicketRepository } from '../../../domain/repositories/ticket.repository';

export class TicketRepositoryImpl extends TicketRepository {
  private cache: TicketEntity[] | null = null;

  constructor(private readonly datasource: TicketDatasource) {
    super();
  }

  async findOne(id: string): Promise<TicketEntity | null> {
    try {
      return await this.datasource.findOne(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAll(): Promise<TicketEntity[]> {
    if (this.cache) return this.cache;

    try {
      this.cache = await this.datasource.getAll();
      return this.cache;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPending(): Promise<TicketEntity[]> {
    try {
      return await this.datasource.getPending();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getLast(): Promise<TicketEntity | null> {
    try {
      return await this.datasource.getLast();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWorkingOn(limit: number): Promise<TicketEntity[]> {
    try {
      return await this.datasource.getWorkingOn(limit);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async create(id: string): Promise<TicketEntity> {
    try {
      const ticket = await this.datasource.create(id);
      this.invalidateCache();
      return ticket;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async update(id: string, data: TicketEntity): Promise<TicketEntity | null> {
    try {
      const ticket = await this.datasource.update(id, data);
      if (ticket) this.invalidateCache();
      return ticket;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const deleted = await this.datasource.delete(id);
      if (deleted) this.invalidateCache();
      return deleted;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async nextPending(desk: string): Promise<TicketEntity | null> {
    try {
      const ticket = await this.datasource.nextPending(desk);
      if (ticket) this.invalidateCache();
      return ticket;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCurrentByDesk(desk: string): Promise<TicketEntity | null> {
    try {
      return await this.datasource.getCurrentByDesk(desk);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async markAsDone(id: string): Promise<TicketEntity | null> {
    try {
      const ticket = await this.datasource.markAsDone(id);
      if (ticket) this.invalidateCache();
      return ticket;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async countAll(): Promise<number> {
    try {
      return await this.datasource.countAll();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async seed(tickets: TicketEntity[]): Promise<void> {
    try {
      await this.datasource.seed(tickets);
      this.invalidateCache();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private invalidateCache(): void {
    this.cache = null;
  }

  private handleError(error: unknown): CustomError {
    if (error instanceof CustomError) return error;

    console.error(error);
    return CustomError.internalServer('Ticket persistence error');
  }
}
