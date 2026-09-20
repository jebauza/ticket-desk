import { UserEntity } from '../../../src/domain/entities/user.entity';

describe('UserEntity.create', () => {
  const validProps = { id: '1', name: 'Ana', email: 'ANA@Test.com', password: 'secret123' };

  it('normaliza el email a minúsculas y recorta el nombre', () => {
    const user = UserEntity.create({ ...validProps, name: '  Ana  ' });
    expect(user.email).toBe('ana@test.com');
    expect(user.name).toBe('Ana');
  });

  it('rechaza un email inválido', () => {
    expect(() => UserEntity.create({ ...validProps, email: 'not-an-email' })).toThrow(
      'email is not valid',
    );
  });

  it('rechaza si falta un campo requerido', () => {
    expect(() => UserEntity.create({ ...validProps, name: '' })).toThrow('name is required');
  });

  it('rechaza un rol fuera del catálogo permitido', () => {
    expect(() => UserEntity.create({ ...validProps, role: 'SUPERADMIN' as any })).toThrow(
      /role must be one of/,
    );
  });

  it('por defecto no es admin', () => {
    const user = UserEntity.create(validProps);
    expect(user.isAdmin).toBe(false);
  });

  it('isAdmin es true solo con role ADMIN', () => {
    const user = UserEntity.create({ ...validProps, role: 'ADMIN' });
    expect(user.isAdmin).toBe(true);
  });
});
