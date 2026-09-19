import { UserEntity } from '../../../../domain/entities/user.entity';
import { RoleEntity } from '../../../../domain/entities/role.entity';
import { UserDatasource } from '../../../../domain/datasources/user.datasource';
import { PaginationDto } from '../../../../domain/dtos/shared/pagination.dto';
import { ExternalApiClient } from '../external-api.client';
import { UserApiMapper, UserApiResponse } from './user.mapper';
import { RoleApiMapper, RoleApiResponse } from '../roles/role.mapper';

// Nota: HttpClientAdapter lanza un Error genérico ante cualquier respuesta
// !ok (incluido un 409 por email duplicado); el repositorio lo traduce a
// CustomError.internalServer, igual que con cualquier otro datasource HTTP.
// Si la API real distingue el conflicto, mapear su código aquí explícitamente.

// Endpoints asumidos, ilustrativos: ajustar rutas y payloads al contrato
// real de la API externa que se integre. La mecánica HTTP en sí queda
// encapsulada en HttpClientAdapter / ExternalApiClient.
export class UserDatasourceImpl extends UserDatasource {
  private get client() {
    return ExternalApiClient.instance;
  }

  async findOne(id: string): Promise<UserEntity | null> {
    const { data } = await this.client.get<UserApiResponse | null>(`/users/${id}`);
    return data ? UserApiMapper.fromResponse(data) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const { data } = await this.client.get<UserApiResponse | null>(
      `/users/by-email/${encodeURIComponent(email)}`,
    );
    return data ? UserApiMapper.fromResponse(data) : null;
  }

  async getAll(pagination: PaginationDto): Promise<UserEntity[]> {
    const { data } = await this.client.get<UserApiResponse[]>(
      `/users?page=${pagination.page}&limit=${pagination.limit}`,
    );
    return data.map(UserApiMapper.fromResponse);
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const { data } = await this.client.post<UserApiResponse>('/users', user);
    return UserApiMapper.fromResponse(data);
  }

  async update(id: string, data: UserEntity): Promise<UserEntity | null> {
    const { data: response } = await this.client.put<UserApiResponse | null>(
      `/users/${id}`,
      data,
    );
    return response ? UserApiMapper.fromResponse(response) : null;
  }

  async delete(id: string): Promise<boolean> {
    const { status } = await this.client.delete<void>(`/users/${id}`);
    return status === 200 || status === 204;
  }

  async countAll(): Promise<number> {
    const { data } = await this.client.get<{ count: number }>('/users/count');
    return data.count;
  }

  async getRoles(userId: string): Promise<RoleEntity[]> {
    const { data } = await this.client.get<RoleApiResponse[]>(`/users/${userId}/roles`);
    return data.map(RoleApiMapper.fromResponse);
  }

  async setRoles(userId: string, roleIds: string[]): Promise<void> {
    await this.client.put<void>(`/users/${userId}/roles`, { roleIds });
  }
}
