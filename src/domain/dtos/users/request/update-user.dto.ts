import { UserRole } from '../../../entities/user.entity';
import { AddressCreateProps } from '../../../entities/address.entity';

const FORBIDDEN_FIELDS = ['id', 'createdAt'];

export class UpdateUserDto {
  private constructor(
    public name?: string,
    public email?: string,
    public password?: string,
    public img?: string,
    public role?: UserRole,
    public emailValidated?: boolean,
    // Reemplaza el set completo de direcciones si se envía (misma semántica
    // que el datasource: DELETE + reinsert, nunca merge).
    public addresses?: AddressCreateProps[],
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string | undefined, UpdateUserDto | undefined] {
    const forbidden = FORBIDDEN_FIELDS.filter((field) => field in object);
    if (forbidden.length > 0) {
      return [`Fields not allowed: ${forbidden.join(', ')}`, undefined];
    }

    const { name, email, password, img, role, emailValidated, addresses } = object;

    if (
      name === undefined &&
      email === undefined &&
      password === undefined &&
      img === undefined &&
      role === undefined &&
      emailValidated === undefined &&
      addresses === undefined
    ) {
      return ['At least one field must be provided', undefined];
    }

    if (password !== undefined && password.length < 6) {
      return ['Password must be at least 6 characters', undefined];
    }
    if (role !== undefined && role !== 'ADMIN' && role !== 'USER') {
      return ['role must be ADMIN or USER', undefined];
    }
    if (addresses !== undefined && !Array.isArray(addresses)) {
      return ['addresses must be an array', undefined];
    }

    return [
      undefined,
      new UpdateUserDto(name, email, password, img, role, emailValidated, addresses),
    ];
  }
}
