import { RoleEntity } from '../entities/role.entity';
import { PermissionEntity } from '../entities/permission.entity';
import { CustomError } from '../errors/custom.error';
import { IdManager } from '../interfaces/id-manager';
import { RoleRepository } from '../repositories/role.repository';
import { CreateRoleDto } from '../dtos/roles/request/create-role.dto';
import { UpdateRoleDto } from '../dtos/roles/request/update-role.dto';
import { SetPermissionsDto } from '../dtos/roles/request/set-permissions.dto';
import { UserResponseDto, UserResponseMapper } from '../dtos/users/response/user.response.dto';

export class RoleService {
  constructor(
    private readonly repository: RoleRepository,
    private readonly idManager: IdManager,
  ) {}

  public async createRole(dto: CreateRoleDto): Promise<RoleEntity> {
    const existing = await this.repository.findByName(dto.name);
    if (existing) throw CustomError.conflict(`Role name (${dto.name}) is already in use`);

    const role = RoleEntity.create({
      id: this.idManager.generate(),
      name: dto.name,
      description: dto.description ?? null,
    });

    return this.repository.create(role);
  }

  public async findById(id: string): Promise<RoleEntity> {
    return this.findEntityById(id);
  }

  public getRoles(): Promise<RoleEntity[]> {
    return this.repository.getAll();
  }

  public async updateRole(id: string, dto: UpdateRoleDto): Promise<RoleEntity> {
    const current = await this.findEntityById(id);

    if (dto.name !== undefined && dto.name !== current.name) {
      const existing = await this.repository.findByName(dto.name);
      if (existing) throw CustomError.conflict(`Role name (${dto.name}) is already in use`);
    }

    const updated = RoleEntity.create({
      id: current.id,
      name: dto.name ?? current.name,
      description: dto.description !== undefined ? dto.description : current.description,
      createdAt: current.createdAt,
      updatedAt: new Date(),
    });

    const role = await this.repository.update(id, updated);
    if (!role) throw CustomError.notFound(`Id (${id}) not found`);

    return role;
  }

  public async deleteRole(id: string): Promise<{ ok: true }> {
    const deleted = await this.repository.delete(id);
    if (!deleted) throw CustomError.notFound(`Id (${id}) not found`);

    return { ok: true };
  }

  // Este servicio es dueño de la escritura de role_permissions.
  public async getRolePermissions(roleId: string): Promise<PermissionEntity[]> {
    await this.findEntityById(roleId);
    return this.repository.getPermissions(roleId);
  }

  public async setRolePermissions(roleId: string, dto: SetPermissionsDto): Promise<void> {
    await this.findEntityById(roleId);
    return this.repository.setPermissions(roleId, dto.permissionIds);
  }

  // Lectura inversa: qué usuarios tienen este rol. Nunca escribe en "users".
  // Se mapea a UserResponseDto aquí mismo (nunca UserEntity cruza hacia la
  // capa HTTP) — la garantía de "password nunca sale del dominio" aplica
  // sin importar qué servicio sea el que devuelva el usuario.
  public async getRoleUsers(roleId: string): Promise<UserResponseDto[]> {
    await this.findEntityById(roleId);
    const users = await this.repository.getUsers(roleId);
    return UserResponseMapper.fromEntities(users);
  }

  private async findEntityById(id: string): Promise<RoleEntity> {
    if (!this.idManager.isValid(id))
      throw CustomError.badRequest('Role id is not a valid uuid');

    const role = await this.repository.findOne(id);
    if (!role) throw CustomError.notFound(`Id (${id}) not found`);

    return role;
  }
}
