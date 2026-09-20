import { AuthService } from '../../../src/domain/services/auth.service';
import { UserEntity } from '../../../src/domain/entities/user.entity';
import { CustomError } from '../../../src/domain/errors/custom.error';
import { CreateUserDto } from '../../../src/domain/dtos/users/request/create-user.dto';
import { LoginUserDto } from '../../../src/domain/dtos/users/request/login-user.dto';
import {
  FakeUserRepository,
  fixedIdManager,
  plainPasswordHasher,
  fakeTokenManager,
} from '../../helpers/fakes';

function buildService() {
  const repository = new FakeUserRepository();
  const service = new AuthService(repository, fixedIdManager, plainPasswordHasher, {
    ...fakeTokenManager,
    generate: async () => 'token-123',
  });
  return { repository, service };
}

describe('AuthService.login', () => {
  it('da el mismo error si el email no existe o si la password falla', async () => {
    const { repository, service } = buildService();

    const [, missingEmailDto] = LoginUserDto.create({ email: 'nadie@test.com', password: 'x' });
    let errorForMissingEmail: CustomError | undefined;
    try {
      await service.login(missingEmailDto!);
    } catch (e) {
      errorForMissingEmail = e as CustomError;
    }

    const existingUser = UserEntity.create({
      id: '1',
      name: 'Ana',
      email: 'ana@test.com',
      password: plainPasswordHasher.hash('correct-password'),
    });
    repository.seed([existingUser]);

    const [, wrongPasswordDto] = LoginUserDto.create({
      email: 'ana@test.com',
      password: 'wrong-password',
    });
    let errorForWrongPassword: CustomError | undefined;
    try {
      await service.login(wrongPasswordDto!);
    } catch (e) {
      errorForWrongPassword = e as CustomError;
    }

    expect(errorForMissingEmail).toBeInstanceOf(CustomError);
    expect(errorForWrongPassword).toBeInstanceOf(CustomError);
    expect(errorForMissingEmail?.statusCode).toBe(errorForWrongPassword?.statusCode);
    expect(errorForMissingEmail?.message).toBe(errorForWrongPassword?.message);
  });

  it('autentica con credenciales correctas', async () => {
    const { repository, service } = buildService();
    const user = UserEntity.create({
      id: '1',
      name: 'Ana',
      email: 'ana@test.com',
      password: plainPasswordHasher.hash('correct-password'),
    });
    repository.seed([user]);

    const [, loginDto] = LoginUserDto.create({
      email: 'ana@test.com',
      password: 'correct-password',
    });
    const result = await service.login(loginDto!);

    expect(result.token).toBe('token-123');
    expect(result.user.email).toBe('ana@test.com');
  });
});

describe('AuthService.register', () => {
  it('nunca incluye la password en la respuesta', async () => {
    const { service } = buildService();

    const [, dto] = CreateUserDto.create({
      name: 'Ana',
      email: 'ana@test.com',
      password: 'secret123',
    });
    const result = await service.register(dto!);

    expect(result.user).not.toHaveProperty('password');
  });

  it('rechaza un email ya registrado', async () => {
    const { repository, service } = buildService();
    repository.seed([
      UserEntity.create({ id: '1', name: 'Ana', email: 'ana@test.com', password: 'hashed' }),
    ]);

    const [, dto] = CreateUserDto.create({
      name: 'Otra',
      email: 'ana@test.com',
      password: 'secret123',
    });

    await expect(service.register(dto!)).rejects.toBeInstanceOf(CustomError);
  });
});
