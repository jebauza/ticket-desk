import { RoleEntity } from '../../../../domain/entities/role.entity';

interface RoleRow {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export class RoleMapper {
  static fromRow(row: RoleRow): RoleEntity {
    return RoleEntity.fromObject({
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}
