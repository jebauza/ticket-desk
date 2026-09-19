import { PermissionEntity } from '../../../domain/entities/permission.entity';
import { RoleEntity } from '../../../domain/entities/role.entity';
import { CustomError } from '../../../domain/errors/custom.error';
import { PermissionDatasource } from '../../../domain/datasources/permission.datasource';
import { PermissionRepository } from '../../../domain/repositories/permission.repository';

export class PermissionRepositoryImpl extends PermissionRepository {
  constructor(private readonly datasource: PermissionDatasource) {
    super();
  }

  async findOne(id: string): Promise<PermissionEntity | null> {
    try {
      return await this.datasource.findOne(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findByName(name: string): Promise<PermissionEntity | null> {
    try {
      return await this.datasource.findByName(name);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAll(): Promise<PermissionEntity[]> {
    try {
      return await this.datasource.getAll();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async create(permission: PermissionEntity): Promise<PermissionEntity> {
    try {
      return await this.datasource.create(permission);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async update(id: string, description: string | null): Promise<PermissionEntity | null> {
    try {
      return await this.datasource.update(id, description);
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

  async getRoles(permissionId: string): Promise<RoleEntity[]> {
    try {
      return await this.datasource.getRoles(permissionId);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): CustomError {
    if (error instanceof CustomError) return error;

    console.error(error);
    return CustomError.internalServer('Permission persistence error');
  }
}
