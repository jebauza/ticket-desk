import { TicketEntity } from '../../src/domain/entities/ticket.entity';
import { TicketRepository } from '../../src/domain/repositories/ticket.repository';
import { UserEntity } from '../../src/domain/entities/user.entity';
import { UserRepository } from '../../src/domain/repositories/user.repository';
import { RoleEntity } from '../../src/domain/entities/role.entity';
import { PaginationDto } from '../../src/domain/dtos/shared/pagination.dto';
import { IdManager } from '../../src/domain/interfaces/id-manager';
import { PasswordHasher } from '../../src/domain/interfaces/password-hasher';
import { TokenManager } from '../../src/domain/interfaces/token-manager';
import { RealtimeNotifier } from '../../src/domain/interfaces/realtime-notifier';

export const fixedIdManager: IdManager = {
  generate: () => 'fixed-id',
  isValid: () => true,
};

// Hash "identidad": compara por igualdad simple, suficiente para test unitario.
export const plainPasswordHasher: PasswordHasher = {
  hash: (plain) => `hashed:${plain}`,
  compare: (plain, hashed) => hashed === `hashed:${plain}`,
};

export const fakeTokenManager: TokenManager = {
  generate: async () => 'fake-token',
  verify: async () => null,
};

export const noopNotifier: RealtimeNotifier = {
  emit: () => {},
};

export class FakeTicketRepository extends TicketRepository {
  private tickets: TicketEntity[] = [];
  getAllCalls = 0;

  async findOne(id: string) {
    return this.tickets.find((t) => t.id === id) ?? null;
  }

  async getAll() {
    this.getAllCalls++;
    return this.tickets;
  }

  async create(id: string) {
    const ticket = TicketEntity.create({ id, number: this.tickets.length + 1 });
    this.tickets.push(ticket);
    return ticket;
  }

  async update(id: string, data: TicketEntity) {
    const index = this.tickets.findIndex((t) => t.id === id);
    if (index === -1) return null;
    this.tickets[index] = data;
    return data;
  }

  async delete(id: string) {
    const before = this.tickets.length;
    this.tickets = this.tickets.filter((t) => t.id !== id);
    return this.tickets.length < before;
  }

  async getPending() {
    return this.tickets.filter((t) => t.isPending);
  }

  async getLast() {
    return this.tickets[this.tickets.length - 1] ?? null;
  }

  async getWorkingOn(limit: number) {
    return this.tickets.filter((t) => !t.isPending).slice(0, limit);
  }

  async nextPending() {
    return this.tickets.find((t) => t.isPending) ?? null;
  }

  async getCurrentByDesk(desk: string) {
    return this.tickets.find((t) => t.handleAtDesk === desk) ?? null;
  }

  async markAsDone(id: string) {
    const ticket = await this.findOne(id);
    if (!ticket) return null;
    ticket.done = true;
    return ticket;
  }

  async countAll() {
    return this.tickets.length;
  }

  // Implementación del puerto TicketRepository.seed (usada por seedTickets()
  // del servicio) — reutiliza el mismo array que el helper de test `seed()`.
  async seed(tickets: TicketEntity[]) {
    this.tickets = tickets;
  }
}

export class FakeUserRepository extends UserRepository {
  private users: UserEntity[] = [];

  seed(users: UserEntity[]) {
    this.users = users;
  }

  async findOne(id: string) {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async findByEmail(email: string) {
    return this.users.find((u) => u.email === email) ?? null;
  }

  async getAll(_pagination: PaginationDto) {
    return this.users;
  }

  async create(user: UserEntity) {
    this.users.push(user);
    return user;
  }

  async update(id: string, data: UserEntity) {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    this.users[index] = data;
    return data;
  }

  async delete(id: string) {
    const before = this.users.length;
    this.users = this.users.filter((u) => u.id !== id);
    return this.users.length < before;
  }

  async countAll() {
    return this.users.length;
  }

  async getRoles(_userId: string): Promise<RoleEntity[]> {
    return [];
  }

  async setRoles(): Promise<void> {}
}
