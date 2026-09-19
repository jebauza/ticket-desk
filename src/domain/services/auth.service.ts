import { UserEntity } from '../entities/user.entity';
import { AddressCreateProps } from '../entities/address.entity';
import { CustomError } from '../errors/custom.error';
import { IdManager } from '../interfaces/id-manager';
import { PasswordHasher } from '../interfaces/password-hasher';
import { TokenManager } from '../interfaces/token-manager';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dtos/users/request/create-user.dto';
import { LoginUserDto } from '../dtos/users/request/login-user.dto';
import { AuthResponseDto } from '../dtos/users/response/auth.response.dto';
import { UserResponseMapper } from '../dtos/users/response/user.response.dto';

export class AuthService {
  constructor(
    private readonly repository: UserRepository,
    private readonly idManager: IdManager,
    private readonly hasher: PasswordHasher,
    private readonly tokenManager: TokenManager,
  ) {}

  public async register(dto: CreateUserDto): Promise<AuthResponseDto> {
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

    return this.buildAuthResponse(created);
  }

  public async login(dto: LoginUserDto): Promise<AuthResponseDto> {
    const user = await this.repository.findByEmail(dto.email);
    // Mensaje genérico deliberado: no revela si el email existe o si falló la
    // password, para no dar pistas a un atacante enumerando cuentas.
    if (!user) throw CustomError.unauthorized('Invalid credentials');

    const passwordMatches = this.hasher.compare(dto.password, user.password);
    if (!passwordMatches) throw CustomError.unauthorized('Invalid credentials');

    return this.buildAuthResponse(user);
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

  private async buildAuthResponse(user: UserEntity): Promise<AuthResponseDto> {
    const token = await this.tokenManager.generate({ id: user.id });
    if (!token) throw CustomError.internalServer('Error generating token');

    return { user: UserResponseMapper.fromEntity(user), token };
  }
}
