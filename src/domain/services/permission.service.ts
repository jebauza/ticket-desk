import { PermissionEntity } from '../entities/permission.entity';
import { RoleEntity } from '../entities/role.entity';
import { CustomError } from '../errors/custom.error';
import { IdManager } from '../interfaces/id-manager';
import { PermissionRepository } from '../repositories/permission.repository';
import { CreatePermissionDto } from '../dtos/permissions/request/create-permission.dto';
import { UpdatePermissionDto } from '../dtos/permissions/request/update-permission.dto';

export class PermissionService {
  constructor(
    private readonly repository: PermissionRepository,
    private readonly idManager: IdManager,
  ) {}

  public async createPermission(dto: CreatePermissionDto): Promise<PermissionEntity> {
    const existing = await this.repository.findByName(dto.name);
    if (existing)
      throw CustomError.conflict(`Permission name (${dto.name}) is already in use`);

    const permission = PermissionEntity.create({
      id: this.idManager.generate(),
      name: dto.name,
      description: dto.description ?? null,
    });

    return this.repository.create(permission);
  }

  public async findById(id: string): Promise<PermissionEntity> {
    return this.findEntityById(id);
  }

  public getPermissions(): Promise<PermissionEntity[]> {
    return this.repository.getAll();
  }

  public async updatePermission(id: string, dto: UpdatePermissionDto): Promise<PermissionEntity> {
    await this.findEntityById(id);

    const permission = await this.repository.update(id, dto.description);
    if (!permission) throw CustomError.notFound(`Id (${id}) not found`);

    return permission;
  }

  public async deletePermission(id: string): Promise<{ ok: true }> {
    const deleted = await this.repository.delete(id);
    if (!deleted) throw CustomError.notFound(`Id (${id}) not found`);

    return { ok: true };
  }

  // Lectura inversa: qué roles tienen este permiso. Nunca escribe en "roles".
  public async getPermissionRoles(permissionId: string): Promise<RoleEntity[]> {
    await this.findEntityById(permissionId);
    return this.repository.getRoles(permissionId);
  }

  private async findEntityById(id: string): Promise<PermissionEntity> {
    if (!this.idManager.isValid(id))
      throw CustomError.badRequest('Permission id is not a valid uuid');

    const permission = await this.repository.findOne(id);
    if (!permission) throw CustomError.notFound(`Id (${id}) not found`);

    return permission;
  }
}
