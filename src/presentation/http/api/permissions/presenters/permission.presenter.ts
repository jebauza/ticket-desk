import { PermissionEntity } from '../../../../../domain/entities/permission.entity';

interface PermissionPresenterDto {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
}

export class PermissionPresenter {
  static fromEntity(permission: PermissionEntity): PermissionPresenterDto {
    return {
      id: permission.id,
      name: permission.name,
      description: permission.description,
      createdAt: permission.createdAt,
    };
  }

  static fromEntities(permissions: PermissionEntity[]): PermissionPresenterDto[] {
    return permissions.map(PermissionPresenter.fromEntity);
  }
}
