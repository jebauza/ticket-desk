import { UserEntity, UserRole } from '../../../../domain/entities/user.entity';
import { AddressEntity } from '../../../../domain/entities/address.entity';

export interface AddressDocument {
  id: string;
  label: string;
  street: string;
  city: string;
  country: string;
}

export interface UserDocument {
  _id: string;
  name: string;
  email: string;
  emailValidated: boolean;
  password: string;
  img: string | null;
  role: UserRole;
  // A diferencia de Postgres (tabla aparte + transacción), en un modelo
  // documental una relación de composición se embebe directamente: no hace
  // falta ni tabla ni transacción, una address vive dentro del mismo
  // documento que su dueño.
  addresses: AddressDocument[];
  // Asociación M:N (User↔Role): array de ids denormalizado, no una tabla de
  // asociación. Vive fuera de toUpdateDocument() a propósito — lo gestiona
  // getRoles/setRoles en el datasource, nunca el update() de campos básicos
  // (si no, cada PUT de perfil borraría los roles asignados).
  roleIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class UserMongoMapper {
  static fromDocument(doc: UserDocument): UserEntity {
    return UserEntity.fromObject({
      id: doc._id,
      name: doc.name,
      email: doc.email,
      emailValidated: doc.emailValidated,
      password: doc.password,
      img: doc.img,
      role: doc.role,
      addresses: doc.addresses,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toUpdateDocument(entity: UserEntity): Omit<UserDocument, '_id' | 'roleIds'> {
    return {
      name: entity.name,
      email: entity.email,
      emailValidated: entity.emailValidated,
      password: entity.password,
      img: entity.img,
      role: entity.role,
      addresses: entity.addresses.map(UserMongoMapper.toAddressDocument),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toAddressDocument(address: AddressEntity): AddressDocument {
    return {
      id: address.id,
      label: address.label,
      street: address.street,
      city: address.city,
      country: address.country,
    };
  }
}
