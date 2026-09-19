import { RoleEntity } from '../../../../domain/entities/role.entity';
import { PermissionEntity } from '../../../../domain/entities/permission.entity';
import { UserEntity } from '../../../../domain/entities/user.entity';
import { RoleDatasource } from '../../../../domain/datasources/role.datasource';
import { ExternalApiClient } from '../external-api.client';
import { RoleApiMapper, RoleApiResponse } from './role.mapper';
import { PermissionApiMapper, PermissionApiResponse } from '../permissions/permission.mapper';
import { UserApiMapper, UserApiResponse } from '../users/user.mapper';

// Endpoints asumidos, ilustrativos: mismo carácter que el resto de
// datasources de API externa del proyecto.
export class RoleDatasourceImpl extends RoleDatasource {
  private get client() {
    return ExternalApiClient.instance;
  }

  async findOne(id: string): Promise<RoleEntity | null> {
    const { data } = await this.client.get<RoleApiResponse | null>(`/roles/${id}`);
    return data ? RoleApiMapper.fromResponse(data) : null;
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    const { data } = await this.client.get<RoleApiResponse | null>(
      `/roles/by-name/${encodeURIComponent(name)}`,
    );
    return data ? RoleApiMapper.fromResponse(data) : null;
  }

  async getAll(): Promise<RoleEntity[]> {
    const { data } = await this.client.get<RoleApiResponse[]>('/roles');
    return data.map(RoleApiMapper.fromResponse);
  }

  async create(role: RoleEntity): Promise<RoleEntity> {
    const { data } = await this.client.post<RoleApiResponse>('/roles', role);
    return RoleApiMapper.fromResponse(data);
  }

  async update(id: string, data: RoleEntity): Promise<RoleEntity | null> {
    const { data: response } = await this.client.put<RoleApiResponse | null>(
      `/roles/${id}`,
      data,
    );
    return response ? RoleApiMapper.fromResponse(response) : null;
  }

  async delete(id: string): Promise<boolean> {
    const { status } = await this.client.delete<void>(`/roles/${id}`);
    return status === 200 || status === 204;
  }

  async getPermissions(roleId: string): Promise<PermissionEntity[]> {
    const { data } = await this.client.get<PermissionApiResponse[]>(
      `/roles/${roleId}/permissions`,
    );
    return data.map(PermissionApiMapper.fromResponse);
  }

  async setPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await this.client.put<void>(`/roles/${roleId}/permissions`, { permissionIds });
  }

  async getUsers(roleId: string): Promise<UserEntity[]> {
    const { data } = await this.client.get<UserApiResponse[]>(`/roles/${roleId}/users`);
    return data.map(UserApiMapper.fromResponse);
  }
}
