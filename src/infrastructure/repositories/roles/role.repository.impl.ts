import { RoleEntity } from '../../../domain/entities/role.entity';
import { PermissionEntity } from '../../../domain/entities/permission.entity';
import { UserEntity } from '../../../domain/entities/user.entity';
import { CustomError } from '../../../domain/errors/custom.error';
import { RoleDatasource } from '../../../domain/datasources/role.datasource';
import { RoleRepository } from '../../../domain/repositories/role.repository';

export class RoleRepositoryImpl extends RoleRepository {
  constructor(private readonly datasource: RoleDatasource) {
    super();
  }

  async findOne(id: string): Promise<RoleEntity | null> {
    try {
      return await this.datasource.findOne(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    try {
      return await this.datasource.findByName(name);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAll(): Promise<RoleEntity[]> {
    try {
      return await this.datasource.getAll();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async create(role: RoleEntity): Promise<RoleEntity> {
    try {
      return await this.datasource.create(role);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async update(id: string, data: RoleEntity): Promise<RoleEntity | null> {
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

  async getPermissions(roleId: string): Promise<PermissionEntity[]> {
    try {
      return await this.datasource.getPermissions(roleId);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async setPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    try {
      return await this.datasource.setPermissions(roleId, permissionIds);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUsers(roleId: string): Promise<UserEntity[]> {
    try {
      return await this.datasource.getUsers(roleId);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): CustomError {
    if (error instanceof CustomError) return error;

    console.error(error);
    return CustomError.internalServer('Role persistence error');
  }
}
