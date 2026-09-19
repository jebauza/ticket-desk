import { RoleEntity } from '../../../../domain/entities/role.entity';

// A diferencia de Postgres (tablas de asociación role_permissions/user_roles),
// en Mongo la M:N se modela con arrays de ids denormalizados directamente en
// el documento: no hay join table ni transacción — es el ajuste idiomático
// del modelo documental, no una traducción 1:1 del esquema relacional.
export interface RoleDocument {
  _id: string;
  name: string;
  description: string | null;
  permissionIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class RoleMongoMapper {
  static fromDocument(doc: RoleDocument): RoleEntity {
    return RoleEntity.fromObject({
      id: doc._id,
      name: doc.name,
      description: doc.description,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
