import { AddressCreateProps, AddressEntity } from './address.entity';

export type UserRole = 'ADMIN' | 'USER';

const VALID_ROLES: UserRole[] = ['ADMIN', 'USER'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface UserCreateProps {
  id: string;
  name: string;
  email: string;
  password: string;
  emailValidated?: boolean;
  img?: string | null;
  role?: UserRole;
  // Datos crudos de entrada (sin validar): UserEntity.create() delega la
  // validación de cada dirección en AddressEntity.create() — el mapper
  // nunca valida, solo reshapea columnas.
  addresses?: AddressCreateProps[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type UserUpdateProps = Partial<Omit<UserCreateProps, 'id'>>;

export class UserEntity {
  private constructor(
    public id: string,
    public name: string,
    public email: string,
    public emailValidated: boolean,
    public password: string,
    public img: string | null,
    public role: UserRole,
    public addresses: AddressEntity[],
    public createdAt: Date,
    public updatedAt: Date,
  ) {}

  public get isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  static create(props: UserCreateProps): UserEntity {
    const {
      id,
      name,
      email,
      password,
      emailValidated,
      img,
      role,
      addresses,
      createdAt,
      updatedAt,
    } = props;

    if (!id) throw new Error('id is required');
    if (!name || !name.trim()) throw new Error('name is required');
    if (!email || !EMAIL_REGEX.test(email)) throw new Error('email is not valid');
    if (!password) throw new Error('password is required');
    if (role !== undefined && !VALID_ROLES.includes(role)) {
      throw new Error(`role must be one of: ${VALID_ROLES.join(', ')}`);
    }

    return new UserEntity(
      id,
      name.trim(),
      email.toLowerCase().trim(),
      !!emailValidated,
      password,
      img ?? null,
      role ?? 'USER',
      (addresses ?? []).map(AddressEntity.create),
      createdAt ? new Date(createdAt) : new Date(),
      updatedAt ? new Date(updatedAt) : new Date(),
    );
  }

  static fromObject(object: { [key: string]: any }): UserEntity {
    const {
      id,
      name,
      email,
      emailValidated,
      password,
      img,
      role,
      addresses,
      createdAt,
      updatedAt,
    } = object;

    return UserEntity.create({
      id,
      name,
      email,
      emailValidated,
      password,
      img,
      role,
      addresses,
      createdAt,
      updatedAt,
    });
  }
}
