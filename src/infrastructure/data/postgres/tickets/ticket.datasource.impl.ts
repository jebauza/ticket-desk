import { TicketEntity } from '../../../../domain/entities/ticket.entity';
import { TicketDatasource } from '../../../../domain/datasources/ticket.datasource';
import { PostgresDatabase } from '../postgres.database';
import { TicketMapper } from './ticket.mapper';

export class TicketDatasourceImpl extends TicketDatasource {
  private get pool() {
    return PostgresDatabase.instance.pool;
  }

  async findOne(id: string): Promise<TicketEntity | null> {
    const { rows } = await this.pool.query(
      'SELECT * FROM tickets WHERE id = $1 LIMIT 1',
      [id],
    );

    return rows[0] ? TicketMapper.fromRow(rows[0]) : null;
  }

  async getAll(): Promise<TicketEntity[]> {
    const { rows } = await this.pool.query(
      'SELECT * FROM tickets ORDER BY number ASC',
    );

    return rows.map(TicketMapper.fromRow);
  }

  async getPending(): Promise<TicketEntity[]> {
    const { rows } = await this.pool.query(
      'SELECT * FROM tickets WHERE handle_at_desk IS NULL ORDER BY number ASC',
    );

    return rows.map(TicketMapper.fromRow);
  }

  async getLast(): Promise<TicketEntity | null> {
    const { rows } = await this.pool.query(
      'SELECT * FROM tickets ORDER BY number DESC LIMIT 1',
    );

    return rows[0] ? TicketMapper.fromRow(rows[0]) : null;
  }

  async getWorkingOn(limit: number): Promise<TicketEntity[]> {
    const { rows } = await this.pool.query(
      'SELECT * FROM tickets WHERE handle_at_desk IS NOT NULL ORDER BY handle_at DESC LIMIT $1',
      [limit],
    );

    return rows.map(TicketMapper.fromRow);
  }

  async create(id: string): Promise<TicketEntity> {
    const { rows } = await this.pool.query(
      `INSERT INTO tickets (id, number)
       VALUES ($1, (SELECT COALESCE(MAX(number), 0) + 1 FROM tickets))
       RETURNING *`,
      [id],
    );

    return TicketMapper.fromRow(rows[0]);
  }

  async nextPending(desk: string): Promise<TicketEntity | null> {
    const { rows } = await this.pool.query(
      `UPDATE tickets
       SET handle_at_desk = $1, handle_at = NOW()
       WHERE id = (
         SELECT id FROM tickets
         WHERE handle_at_desk IS NULL
         ORDER BY number ASC
         LIMIT 1
         FOR UPDATE SKIP LOCKED
       )
       RETURNING *`,
      [desk],
    );

    return rows[0] ? TicketMapper.fromRow(rows[0]) : null;
  }

  async getCurrentByDesk(desk: string): Promise<TicketEntity | null> {
    const { rows } = await this.pool.query(
      `SELECT * FROM tickets
       WHERE handle_at_desk = $1 AND done = false
       ORDER BY handle_at DESC
       LIMIT 1`,
      [desk],
    );

    return rows[0] ? TicketMapper.fromRow(rows[0]) : null;
  }

  async markAsDone(id: string): Promise<TicketEntity | null> {
    const { rows } = await this.pool.query(
      'UPDATE tickets SET done = true WHERE id = $1 RETURNING *',
      [id],
    );

    return rows[0] ? TicketMapper.fromRow(rows[0]) : null;
  }

  async countAll(): Promise<number> {
    const { rows } = await this.pool.query(
      'SELECT COUNT(*)::int AS count FROM tickets',
    );

    return Number(rows[0]?.count ?? 0);
  }

  async seed(tickets: TicketEntity[]): Promise<void> {
    for (const ticket of tickets) {
      await this.pool.query(
        `INSERT INTO tickets (id, number, create_at, handle_at_desk, handle_at, done)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [
          ticket.id,
          ticket.number,
          ticket.createAt,
          ticket.handleAtDesk,
          ticket.handleAt,
          ticket.done,
        ],
      );
    }
  }
}
