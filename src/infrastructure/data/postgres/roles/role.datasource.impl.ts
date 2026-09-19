import { RoleEntity } from '../../../../domain/entities/role.entity';
import { PermissionEntity } from '../../../../domain/entities/permission.entity';
import { UserEntity } from '../../../../domain/entities/user.entity';
import { RoleDatasource } from '../../../../domain/datasources/role.datasource';
import { CustomError } from '../../../../domain/errors/custom.error';
import { PostgresDatabase } from '../postgres.database';
import { RoleMapper } from './role.mapper';
import { PermissionMapper } from '../permissions/permission.mapper';
import { UserMapper } from '../users/user.mapper';

const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

export class RoleDatasourceImpl extends RoleDatasource {
  private get db() {
    return PostgresDatabase.instance;
  }

  private get pool() {
    return this.db.pool;
  }

  async findOne(id: string): Promise<RoleEntity | null> {
    const { rows } = await this.pool.query('SELECT * FROM roles WHERE id = $1 LIMIT 1', [id]);
    return rows[0] ? RoleMapper.fromRow(rows[0]) : null;
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    const { rows } = await this.pool.query(
      'SELECT * FROM roles WHERE LOWER(name) = LOWER($1) LIMIT 1',
      [name],
    );
    return rows[0] ? RoleMapper.fromRow(rows[0]) : null;
  }

  async getAll(): Promise<RoleEntity[]> {
    const { rows } = await this.pool.query('SELECT * FROM roles ORDER BY name ASC');
    return rows.map(RoleMapper.fromRow);
  }

  async create(role: RoleEntity): Promise<RoleEntity> {
    try {
      const { rows } = await this.pool.query(
        `INSERT INTO roles (id, name, description)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [role.id, role.name, role.description],
      );
      return RoleMapper.fromRow(rows[0]);
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async update(id: string, data: RoleEntity): Promise<RoleEntity | null> {
    try {
      const { rows } = await this.pool.query(
        `UPDATE roles SET name = $2, description = $3, updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id, data.name, data.description],
      );
      return rows[0] ? RoleMapper.fromRow(rows[0]) : null;
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async delete(id: string): Promise<boolean> {
    // ON DELETE CASCADE en role_permissions/user_roles limpia las
    // asociaciones solo — nunca borra permissions ni users.
    const result = await this.pool.query('DELETE FROM roles WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async getPermissions(roleId: string): Promise<PermissionEntity[]> {
    const { rows } = await this.pool.query(
      `SELECT p.* FROM permissions p
       INNER JOIN role_permissions rp ON rp.permission_id = p.id
       WHERE rp.role_id = $1
       ORDER BY p.name ASC`,
      [roleId],
    );
    return rows.map(PermissionMapper.fromRow);
  }

  async setPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    try {
      await this.db.transaction(async (client) => {
        await client.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);

        for (const permissionId of permissionIds) {
          await client.query(
            'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
            [roleId, permissionId],
          );
        }
      });
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async getUsers(roleId: string): Promise<UserEntity[]> {
    const { rows } = await this.pool.query(
      `SELECT u.* FROM users u
       INNER JOIN user_roles ur ON ur.user_id = u.id
       WHERE ur.role_id = $1
       ORDER BY u.created_at ASC`,
      [roleId],
    );
    // Sin addresses: es una lectura inversa/listado, mismo criterio que
    // UserDatasourceImpl.getAll() — el detalle completo se pide aparte.
    return rows.map(UserMapper.fromRow);
  }

  private translateError(error: unknown): Error {
    if (error && typeof error === 'object' && 'code' in error) {
      const pgError = error as { code: string };

      if (pgError.code === UNIQUE_VIOLATION) {
        return CustomError.conflict('Role name is already in use');
      }
      if (pgError.code === FOREIGN_KEY_VIOLATION) {
        return CustomError.badRequest('One or more permission ids do not exist');
      }
    }

    return error as Error;
  }
}
