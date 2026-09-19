import { UserEntity, UserRole } from '../../../../domain/entities/user.entity';
import { AddressCreateProps } from '../../../../domain/entities/address.entity';

// Shape asumido de la respuesta JSON de la API externa. Ajustar al contrato
// real una vez que exista una API concreta que integrar.
export interface UserApiResponse {
  id: string;
  name: string;
  email: string;
  emailValidated: boolean;
  password: string;
  img?: string;
  role: UserRole;
  addresses?: AddressCreateProps[];
  createdAt: string;
  updatedAt: string;
}

export class UserApiMapper {
  static fromResponse(row: UserApiResponse): UserEntity {
    return UserEntity.fromObject(row);
  }
}
