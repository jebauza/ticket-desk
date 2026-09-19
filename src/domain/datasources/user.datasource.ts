import { UserEntity } from '../entities/user.entity';
import { RoleEntity } from '../entities/role.entity';
import { PaginationDto } from '../dtos/shared/pagination.dto';

export abstract class UserDatasource {
  abstract findOne(id: string): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract getAll(pagination: PaginationDto): Promise<UserEntity[]>;
  abstract create(user: UserEntity): Promise<UserEntity>;
  abstract update(id: string, data: UserEntity): Promise<UserEntity | null>;
  abstract delete(id: string): Promise<boolean>;
  abstract countAll(): Promise<number>;

  // Dueño de la escritura de user_roles (reemplazo total, transaccional).
  abstract getRoles(userId: string): Promise<RoleEntity[]>;
  abstract setRoles(userId: string, roleIds: string[]): Promise<void>;
}
