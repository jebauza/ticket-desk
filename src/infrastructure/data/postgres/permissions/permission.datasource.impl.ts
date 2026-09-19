import { PermissionEntity } from '../../../../domain/entities/permission.entity';
import { RoleEntity } from '../../../../domain/entities/role.entity';
import { PermissionDatasource } from '../../../../domain/datasources/permission.datasource';
import { CustomError } from '../../../../domain/errors/custom.error';
import { PostgresDatabase } from '../postgres.database';
import { PermissionMapper } from './permission.mapper';
import { RoleMapper } from '../roles/role.mapper';

const UNIQUE_VIOLATION = '23505';

export class PermissionDatasourceImpl extends PermissionDatasource {
  private get pool() {
    return PostgresDatabase.instance.pool;
  }

  async findOne(id: string): Promise<PermissionEntity | null> {
    const { rows } = await this.pool.query(
      'SELECT * FROM permissions WHERE id = $1 LIMIT 1',
      [id],
    );
    return rows[0] ? PermissionMapper.fromRow(rows[0]) : null;
  }

  async findByName(name: string): Promise<PermissionEntity | null> {
    const { rows } = await this.pool.query(
      'SELECT * FROM permissions WHERE LOWER(name) = LOWER($1) LIMIT 1',
      [name],
    );
    return rows[0] ? PermissionMapper.fromRow(rows[0]) : null;
  }

  async getAll(): Promise<PermissionEntity[]> {
    const { rows } = await this.pool.query('SELECT * FROM permissions ORDER BY name ASC');
    return rows.map(PermissionMapper.fromRow);
  }

  async create(permission: PermissionEntity): Promise<PermissionEntity> {
    try {
      const { rows } = await this.pool.query(
        `INSERT INTO permissions (id, name, description)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [permission.id, permission.name, permission.description],
      );
      return PermissionMapper.fromRow(rows[0]);
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async update(id: string, description: string | null): Promise<PermissionEntity | null> {
    const { rows } = await this.pool.query(
      `UPDATE permissions SET description = $2 WHERE id = $1 RETURNING *`,
      [id, description],
    );
    return rows[0] ? PermissionMapper.fromRow(rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM permissions WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async getRoles(permissionId: string): Promise<RoleEntity[]> {
    const { rows } = await this.pool.query(
      `SELECT r.* FROM roles r
       INNER JOIN role_permissions rp ON rp.role_id = r.id
       WHERE rp.permission_id = $1
       ORDER BY r.name ASC`,
      [permissionId],
    );
    return rows.map(RoleMapper.fromRow);
  }

  private translateError(error: unknown): Error {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === UNIQUE_VIOLATION
    ) {
      return CustomError.conflict('Permission name is already in use');
    }

    return error as Error;
  }
}
