import { UserEntity, UserRole } from '../../../entities/user.entity';
import { AddressEntity } from '../../../entities/address.entity';

// Forma pública de un usuario: nunca lleva `password`. Los servicios de
// dominio devuelven este DTO en vez de UserEntity — el compilador impide
// que el secreto se filtre hacia arriba, sin depender de que la capa HTTP
// recuerde pasar por un presenter.
export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  emailValidated: boolean;
  img: string | null;
  role: UserRole;
  // Composición: las direcciones SÍ viajan con el usuario (a diferencia de
  // los roles, que son una asociación entre agregados independientes y se
  // piden aparte — ver GET /api/users/:id/roles).
  addresses: AddressEntity[];
  createdAt: Date;
  updatedAt: Date;
}

export class UserResponseMapper {
  static fromEntity(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      emailValidated: user.emailValidated,
      img: user.img,
      role: user.role,
      addresses: user.addresses,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static fromEntities(users: UserEntity[]): UserResponseDto[] {
    return users.map(UserResponseMapper.fromEntity);
  }
}
