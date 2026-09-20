import { UserEntity } from '../entities/user.entity';
import { AddressCreateProps } from '../entities/address.entity';
import { RoleEntity } from '../entities/role.entity';
import { CustomError } from '../errors/custom.error';
import { IdManager } from '../interfaces/id-manager';
import { PasswordHasher } from '../interfaces/password-hasher';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dtos/users/request/create-user.dto';
import { UpdateUserDto } from '../dtos/users/request/update-user.dto';
import { SetRolesDto } from '../dtos/users/request/set-roles.dto';
import { PaginationDto } from '../dtos/shared/pagination.dto';
import { UserResponseDto, UserResponseMapper } from '../dtos/users/response/user.response.dto';

export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly idManager: IdManager,
    private readonly hasher: PasswordHasher,
  ) {}

  public async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.repository.findByEmail(dto.email);
    if (existing) throw CustomError.conflict(`Email (${dto.email}) is already in use`);

    const user = UserEntity.create({
      id: this.idManager.generate(),
      name: dto.name,
      email: dto.email,
      password: this.hasher.hash(dto.password),
      img: dto.img ?? null,
      role: dto.role ?? 'USER',
      addresses: this.normalizeAddressIds(dto.addresses),
    });

    const created = await this.repository.create(user);
    return UserResponseMapper.fromEntity(created);
  }

  public async findById(id: string): Promise<UserResponseDto> {
    const user = await this.findEntityById(id);
    return UserResponseMapper.fromEntity(user);
  }

  public async getUsers(pagination: PaginationDto): Promise<UserResponseDto[]> {
    const users = await this.repository.getAll(pagination);
    return UserResponseMapper.fromEntities(users);
  }

  public async updateUser(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    if (!this.idManager.isValid(id))
      throw CustomError.badRequest('User id is not a valid uuid');

    const current = await this.findEntityById(id);

    if (dto.email !== undefined && dto.email !== current.email) {
      const existing = await this.repository.findByEmail(dto.email);
      if (existing) throw CustomError.conflict(`Email (${dto.email}) is already in use`);
    }

    // Merge del patch parcial contra la entidad actual: hacia abajo (repo/datasource)
    // siempre viaja una UserEntity completa y válida, nunca un objeto parcial.
    const updated = UserEntity.create({
      id: current.id,
      name: dto.name ?? current.name,
      email: dto.email ?? current.email,
      password: dto.password ? this.hasher.hash(dto.password) : current.password,
      img: dto.img !== undefined ? dto.img : current.img,
      role: dto.role ?? current.role,
      emailValidated: dto.emailValidated ?? current.emailValidated,
      addresses: dto.addresses ? this.normalizeAddressIds(dto.addresses) : current.addresses,
      createdAt: current.createdAt,
      updatedAt: new Date(),
    });

    const user = await this.repository.update(id, updated);
    if (!user) throw CustomError.notFound(`Id (${id}) not found`);

    return UserResponseMapper.fromEntity(user);
  }

  public async deleteUser(id: string): Promise<{ ok: true }> {
    if (!this.idManager.isValid(id))
      throw CustomError.badRequest('User id is not a valid uuid');

    const deleted = await this.repository.delete(id);
    if (!deleted) throw CustomError.notFound(`Id (${id}) not found`);

    return { ok: true };
  }

  // Este servicio es dueño de la escritura de user_roles. GET /api/users/:id
  // no trae roles automáticamente (a diferencia de addresses, que sí viaja
  // con el agregado) — Role es un agregado independiente, se pide aparte.

  public async getUserRoles(id: string): Promise<RoleEntity[]> {
    await this.findEntityById(id);
    return this.repository.getRoles(id);
  }

  public async setUserRoles(id: string, dto: SetRolesDto): Promise<void> {
    await this.findEntityById(id);
    return this.repository.setRoles(id, dto.roleIds);
  }

  // El id de cada address lo genera el service (vía IdManager, ya
  // inyectado), nunca la entidad — AddressEntity.create() exige que ya
  // venga, igual que el resto de entidades con su propio id.
  private normalizeAddressIds(addresses: AddressCreateProps[] | undefined): AddressCreateProps[] {
    return (addresses ?? []).map((address) => ({
      ...address,
      id: address.id ?? this.idManager.generate(),
    }));
  }

  private async findEntityById(id: string): Promise<UserEntity> {
    if (!this.idManager.isValid(id))
      throw CustomError.badRequest('User id is not a valid uuid');

    const user = await this.repository.findOne(id);
    if (!user) throw CustomError.notFound(`Id (${id}) not found`);

    return user;
  }
}
