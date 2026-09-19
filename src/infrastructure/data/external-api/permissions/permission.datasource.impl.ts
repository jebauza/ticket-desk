import { PermissionEntity } from '../../../../domain/entities/permission.entity';
import { RoleEntity } from '../../../../domain/entities/role.entity';
import { PermissionDatasource } from '../../../../domain/datasources/permission.datasource';
import { ExternalApiClient } from '../external-api.client';
import { PermissionApiMapper, PermissionApiResponse } from './permission.mapper';
import { RoleApiMapper, RoleApiResponse } from '../roles/role.mapper';

export class PermissionDatasourceImpl extends PermissionDatasource {
  private get client() {
    return ExternalApiClient.instance;
  }

  async findOne(id: string): Promise<PermissionEntity | null> {
    const { data } = await this.client.get<PermissionApiResponse | null>(`/permissions/${id}`);
    return data ? PermissionApiMapper.fromResponse(data) : null;
  }

  async findByName(name: string): Promise<PermissionEntity | null> {
    const { data } = await this.client.get<PermissionApiResponse | null>(
      `/permissions/by-name/${encodeURIComponent(name)}`,
    );
    return data ? PermissionApiMapper.fromResponse(data) : null;
  }

  async getAll(): Promise<PermissionEntity[]> {
    const { data } = await this.client.get<PermissionApiResponse[]>('/permissions');
    return data.map(PermissionApiMapper.fromResponse);
  }

  async create(permission: PermissionEntity): Promise<PermissionEntity> {
    const { data } = await this.client.post<PermissionApiResponse>('/permissions', permission);
    return PermissionApiMapper.fromResponse(data);
  }

  async update(id: string, description: string | null): Promise<PermissionEntity | null> {
    const { data } = await this.client.put<PermissionApiResponse | null>(
      `/permissions/${id}`,
      { description },
    );
    return data ? PermissionApiMapper.fromResponse(data) : null;
  }

  async delete(id: string): Promise<boolean> {
    const { status } = await this.client.delete<void>(`/permissions/${id}`);
    return status === 200 || status === 204;
  }

  async getRoles(permissionId: string): Promise<RoleEntity[]> {
    const { data } = await this.client.get<RoleApiResponse[]>(
      `/permissions/${permissionId}/roles`,
    );
    return data.map(RoleApiMapper.fromResponse);
  }
}
