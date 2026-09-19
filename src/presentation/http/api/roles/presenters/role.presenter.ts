import { RoleEntity } from '../../../../../domain/entities/role.entity';

interface RolePresenterDto {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class RolePresenter {
  static fromEntity(role: RoleEntity): RolePresenterDto {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  static fromEntities(roles: RoleEntity[]): RolePresenterDto[] {
    return roles.map(RolePresenter.fromEntity);
  }
}
