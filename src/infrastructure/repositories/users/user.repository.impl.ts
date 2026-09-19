import { UserEntity } from '../../../domain/entities/user.entity';
import { RoleEntity } from '../../../domain/entities/role.entity';
import { CustomError } from '../../../domain/errors/custom.error';
import { UserDatasource } from '../../../domain/datasources/user.datasource';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { PaginationDto } from '../../../domain/dtos/shared/pagination.dto';

// Sin caché (a diferencia de TicketRepositoryImpl): el listado es paginado y
// mutable por usuario, una caché global de getAll daría lecturas obsoletas.
export class UserRepositoryImpl extends UserRepository {
  constructor(private readonly datasource: UserDatasource) {
    super();
  }

  async findOne(id: string): Promise<UserEntity | null> {
    try {
      return await this.datasource.findOne(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      return await this.datasource.findByEmail(email);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAll(pagination: PaginationDto): Promise<UserEntity[]> {
    try {
      return await this.datasource.getAll(pagination);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async create(user: UserEntity): Promise<UserEntity> {
    try {
      return await this.datasource.create(user);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async update(id: string, data: UserEntity): Promise<UserEntity | null> {
    try {
      return await this.datasource.update(id, data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      return await this.datasource.delete(id);
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

  async getRoles(userId: string): Promise<RoleEntity[]> {
    try {
      return await this.datasource.getRoles(userId);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async setRoles(userId: string, roleIds: string[]): Promise<void> {
    try {
      return await this.datasource.setRoles(userId, roleIds);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): CustomError {
    if (error instanceof CustomError) return error;

    console.error(error);
    return CustomError.internalServer('User persistence error');
  }
}
