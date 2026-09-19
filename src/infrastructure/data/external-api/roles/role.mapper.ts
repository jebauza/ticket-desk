import { RoleEntity } from '../../../../domain/entities/role.entity';

export interface RoleApiResponse {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export class RoleApiMapper {
  static fromResponse(row: RoleApiResponse): RoleEntity {
    return RoleEntity.fromObject(row);
  }
}
