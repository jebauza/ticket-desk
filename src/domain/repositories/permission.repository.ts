import { PermissionEntity } from '../entities/permission.entity';
import { RoleEntity } from '../entities/role.entity';

export abstract class PermissionRepository {
  abstract findOne(id: string): Promise<PermissionEntity | null>;
  abstract findByName(name: string): Promise<PermissionEntity | null>;
  abstract getAll(): Promise<PermissionEntity[]>;
  abstract create(permission: PermissionEntity): Promise<PermissionEntity>;
  abstract update(id: string, description: string | null): Promise<PermissionEntity | null>;
  abstract delete(id: string): Promise<boolean>;

  abstract getRoles(permissionId: string): Promise<RoleEntity[]>;
}
