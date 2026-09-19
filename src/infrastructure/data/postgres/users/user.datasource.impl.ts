import { PoolClient } from 'pg';
import { UserEntity } from '../../../../domain/entities/user.entity';
import { AddressEntity } from '../../../../domain/entities/address.entity';
import { RoleEntity } from '../../../../domain/entities/role.entity';
import { UserDatasource } from '../../../../domain/datasources/user.datasource';
import { PaginationDto } from '../../../../domain/dtos/shared/pagination.dto';
import { CustomError } from '../../../../domain/errors/custom.error';
import { PostgresDatabase } from '../postgres.database';
import { UserMapper } from './user.mapper';
import { RoleMapper } from '../roles/role.mapper';

// Código de error de Postgres para "unique_violation" (constraint UQ_users_email).
const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

export class UserDatasourceImpl extends UserDatasource {
  private get db() {
    return PostgresDatabase.instance;
  }

  private get pool() {
    return this.db.pool;
  }

  async findOne(id: string): Promise<UserEntity | null> {
    const { rows } = await this.pool.query(
      'SELECT * FROM users WHERE id = $1 LIMIT 1',
      [id],
    );
    if (!rows[0]) return null;

    const { rows: addressRows } = await this.pool.query(
      'SELECT * FROM addresses WHERE user_id = $1 ORDER BY created_at ASC',
      [id],
    );

    return UserMapper.fromRowWithAddresses(rows[0], addressRows);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const { rows } = await this.pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
      [email],
    );

    return rows[0] ? UserMapper.fromRow(rows[0]) : null;
  }

  async getAll(pagination: PaginationDto): Promise<UserEntity[]> {
    const offset = (pagination.page - 1) * pagination.limit;

    const { rows } = await this.pool.query(
      'SELECT * FROM users ORDER BY created_at ASC LIMIT $1 OFFSET $2',
      [pagination.limit, offset],
    );

    return rows.map(UserMapper.fromRow);
  }

  async create(user: UserEntity): Promise<UserEntity> {
    try {
      return await this.db.transaction(async (client) => {
        const { rows } = await client.query(
          `INSERT INTO users (id, name, email, email_validated, password, img, role)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [
            user.id,
            user.name,
            user.email,
            user.emailValidated,
            user.password,
            user.img,
            user.role,
          ],
        );

        const addresses = await this.insertAddresses(client, user.id, user.addresses);

        return UserMapper.fromRowWithAddresses(rows[0], addresses);
      });
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async update(id: string, data: UserEntity): Promise<UserEntity | null> {
    try {
      return await this.db.transaction(async (client) => {
        const { rows } = await client.query(
          `UPDATE users SET
             name = $2,
             email = $3,
             email_validated = $4,
             password = $5,
             img = $6,
             role = $7,
             updated_at = NOW()
           WHERE id = $1
           RETURNING *`,
          [
            id,
            data.name,
            data.email,
            data.emailValidated,
            data.password,
            data.img,
            data.role,
          ],
        );

        if (!rows[0]) return null;

        // Reemplazo total del set de direcciones: DELETE + reinsert dentro de
        // la misma transacción que el UPDATE del usuario. Semántica: un PUT
        // reemplaza exactamente el array recibido, no hace merge.
        await client.query('DELETE FROM addresses WHERE user_id = $1', [id]);
        const addresses = await this.insertAddresses(client, id, data.addresses);

        return UserMapper.fromRowWithAddresses(rows[0], addresses);
      });
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async delete(id: string): Promise<boolean> {
    // No hace falta borrar addresses a mano: ON DELETE CASCADE en la
    // migración se encarga a nivel de base de datos.
    const result = await this.pool.query('DELETE FROM users WHERE id = $1', [id]);

    return (result.rowCount ?? 0) > 0;
  }

  async countAll(): Promise<number> {
    const { rows } = await this.pool.query('SELECT COUNT(*)::int AS count FROM users');

    return Number(rows[0]?.count ?? 0);
  }

  async getRoles(userId: string): Promise<RoleEntity[]> {
    const { rows } = await this.pool.query(
      `SELECT r.* FROM roles r
       INNER JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = $1
       ORDER BY r.name ASC`,
      [userId],
    );
    return rows.map(RoleMapper.fromRow);
  }

  async setRoles(userId: string, roleIds: string[]): Promise<void> {
    try {
      await this.db.transaction(async (client) => {
        await client.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);

        for (const roleId of roleIds) {
          await client.query(
            'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
            [userId, roleId],
          );
        }
      });
    } catch (error) {
      throw this.translateError(error);
    }
  }

  private async insertAddresses(
    client: PoolClient,
    userId: string,
    addresses: AddressEntity[],
  ) {
    const rows = [];
    for (const address of addresses) {
      const { rows: inserted } = await client.query(
        `INSERT INTO addresses (id, user_id, label, street, city, country)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [address.id, userId, address.label, address.street, address.city, address.country],
      );
      rows.push(inserted[0]);
    }
    return rows;
  }

  // Traduce el unique violation de Postgres a un error de dominio aquí mismo:
  // el repositorio no conoce códigos de error SQL, solo tecnologías concretas los conocen.
  // Importante: el código 23505 se dispara para CUALQUIER constraint única de
  // la transacción (email, o el PK de addresses si llegan dos direcciones
  // con el mismo id) — hay que mirar el nombre de la constraint, no asumir
  // que todo 23505 es el email.
  private translateError(error: unknown): Error {
    if (error && typeof error === 'object' && 'code' in error) {
      const pgError = error as { code: string; constraint?: string };

      if (pgError.code === UNIQUE_VIOLATION) {
        if (pgError.constraint === 'UQ_users_email') {
          return CustomError.conflict('Email is already in use');
        }
        return CustomError.conflict('Duplicate value violates a unique constraint');
      }
      if (pgError.code === FOREIGN_KEY_VIOLATION) {
        return CustomError.badRequest('One or more role ids do not exist');
      }
    }

    return error as Error;
  }
}
