import { PermissionEntity } from '../../../../domain/entities/permission.entity';

export interface PermissionApiResponse {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export class PermissionApiMapper {
  static fromResponse(row: PermissionApiResponse): PermissionEntity {
    return PermissionEntity.fromObject(row);
  }
}
