import { UserRole } from '../../../entities/user.entity';
import { AddressCreateProps } from '../../../entities/address.entity';

export class CreateUserDto {
  private constructor(
    public name: string,
    public email: string,
    public password: string,
    public img?: string,
    public role?: UserRole,
    public addresses?: AddressCreateProps[],
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string | undefined, CreateUserDto | undefined] {
    const { name, email, password, img, role, addresses } = object;

    if (!name) return ['Missing name', undefined];
    if (!email) return ['Missing email', undefined];
    if (!password) return ['Missing password', undefined];
    if (password.length < 6) return ['Password must be at least 6 characters', undefined];
    if (role !== undefined && role !== 'ADMIN' && role !== 'USER') {
      return ['role must be ADMIN or USER', undefined];
    }
    if (addresses !== undefined && !Array.isArray(addresses)) {
      return ['addresses must be an array', undefined];
    }

    return [undefined, new CreateUserDto(name, email, password, img, role, addresses)];
  }
}
