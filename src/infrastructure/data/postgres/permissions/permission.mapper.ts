import { PermissionEntity } from '../../../../domain/entities/permission.entity';

interface PermissionRow {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
}

export class PermissionMapper {
  static fromRow(row: PermissionRow): PermissionEntity {
    return PermissionEntity.fromObject({
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
    });
  }
}
