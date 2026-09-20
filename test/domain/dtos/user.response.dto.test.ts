import { UserResponseMapper } from '../../../src/domain/dtos/users/response/user.response.dto';
import { UserEntity } from '../../../src/domain/entities/user.entity';

it('el DTO de respuesta nunca incluye la password', () => {
  const user = UserEntity.create({
    id: '1',
    name: 'Ana',
    email: 'a@test.com',
    password: 'hashed-secret',
  });

  const dto = UserResponseMapper.fromEntity(user);

  expect(dto).not.toHaveProperty('password');
  expect(JSON.stringify(dto)).not.toMatch(/hashed-secret/);
});
