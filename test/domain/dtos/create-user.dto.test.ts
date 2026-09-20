import { CreateUserDto } from '../../../src/domain/dtos/users/request/create-user.dto';

describe('CreateUserDto.create', () => {
  it('devuelve error si falta el email', () => {
    const [error, dto] = CreateUserDto.create({ name: 'Ana', password: 'secret123' });
    expect(error).toBe('Missing email');
    expect(dto).toBeUndefined();
  });

  it('devuelve error si falta el nombre', () => {
    const [error] = CreateUserDto.create({ email: 'ana@test.com', password: 'secret123' });
    expect(error).toBe('Missing name');
  });

  it('devuelve error si la password es demasiado corta', () => {
    const [error] = CreateUserDto.create({ name: 'Ana', email: 'ana@test.com', password: '123' });
    expect(error).toBe('Password must be at least 6 characters');
  });

  it('devuelve error si el role no es ADMIN ni USER', () => {
    const [error] = CreateUserDto.create({
      name: 'Ana',
      email: 'ana@test.com',
      password: 'secret123',
      role: 'ROOT',
    });
    expect(error).toBe('role must be ADMIN or USER');
  });

  it('devuelve error si addresses no es un array', () => {
    const [error] = CreateUserDto.create({
      name: 'Ana',
      email: 'ana@test.com',
      password: 'secret123',
      addresses: 'not-an-array',
    });
    expect(error).toBe('addresses must be an array');
  });

  it('devuelve el DTO en el caso feliz', () => {
    const [error, dto] = CreateUserDto.create({
      name: 'Ana',
      email: 'ana@test.com',
      password: 'secret123',
    });
    expect(error).toBeUndefined();
    expect(dto?.email).toBe('ana@test.com');
  });
});
