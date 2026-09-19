import { RoleEntity } from '../entities/role.entity';
import { PermissionEntity } from '../entities/permission.entity';
import { UserEntity } from '../entities/user.entity';

export abstract class RoleDatasource {
  abstract findOne(id: string): Promise<RoleEntity | null>;
  abstract findByName(name: string): Promise<RoleEntity | null>;
  abstract getAll(): Promise<RoleEntity[]>;
  abstract create(role: RoleEntity): Promise<RoleEntity>;
  abstract update(id: string, data: RoleEntity): Promise<RoleEntity | null>;
  abstract delete(id: string): Promise<boolean>;

  // Dueño de la escritura de role_permissions (reemplazo total). La lectura
  // inversa de "qué usuarios tienen este rol" es de solo lectura — nunca
  // escribe en users ni en user_roles.
  abstract getPermissions(roleId: string): Promise<PermissionEntity[]>;
  abstract setPermissions(roleId: string, permissionIds: string[]): Promise<void>;
  abstract getUsers(roleId: string): Promise<UserEntity[]>;
}
