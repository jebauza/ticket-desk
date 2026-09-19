import { PermissionEntity } from '../../../../domain/entities/permission.entity';

export interface PermissionDocument {
  _id: string;
  name: string;
  description: string | null;
  createdAt: Date;
}

export class PermissionMongoMapper {
  static fromDocument(doc: PermissionDocument): PermissionEntity {
    return PermissionEntity.fromObject({
      id: doc._id,
      name: doc.name,
      description: doc.description,
      createdAt: doc.createdAt,
    });
  }
}
