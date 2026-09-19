import { UserEntity } from '../../../../domain/entities/user.entity';
import { AddressCreateProps } from '../../../../domain/entities/address.entity';

interface UserRow {
  id: string;
  name: string;
  email: string;
  email_validated: boolean;
  password: string;
  img: string | null;
  role: string;
  created_at: Date;
  updated_at: Date;
}

interface AddressRow {
  id: string;
  user_id: string;
  label: string;
  street: string;
  city: string;
  country: string;
  created_at: Date;
}

export class UserMapper {
  // Usado por getAll(): sin direcciones — un listado paginado no paga el
  // costo de un join/segunda query por fila. El detalle completo del
  // agregado (con addresses) solo se expone vía fromRowWithAddresses.
  static fromRow(row: UserRow): UserEntity {
    return UserEntity.fromObject({
      id: row.id,
      name: row.name,
      email: row.email,
      emailValidated: row.email_validated,
      password: row.password,
      img: row.img,
      role: row.role,
      addresses: [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  // Usado por findOne/create/update: arma el agregado completo a partir de
  // la fila de "users" y las filas relacionadas de "addresses".
  static fromRowWithAddresses(row: UserRow, addressRows: AddressRow[]): UserEntity {
    return UserEntity.fromObject({
      id: row.id,
      name: row.name,
      email: row.email,
      emailValidated: row.email_validated,
      password: row.password,
      img: row.img,
      role: row.role,
      addresses: addressRows.map(UserMapper.addressFromRow),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  static addressFromRow(row: AddressRow): AddressCreateProps {
    return {
      id: row.id,
      label: row.label,
      street: row.street,
      city: row.city,
      country: row.country,
    };
  }
}
