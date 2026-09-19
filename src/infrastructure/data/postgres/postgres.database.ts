import { Pool, PoolClient } from 'pg';

interface Options {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export class PostgresDatabase {
  private static _instance: PostgresDatabase;
  public readonly pool: Pool;

  private constructor(options: Options) {
    const { host, port, database, user, password } = options;
    this.pool = new Pool({ host, port, database, user, password });

    // Sin este listener, un error de una conexión idle (ej. la BD se reinicia)
    // se propaga como excepción no capturada y tumba el proceso.
    this.pool.on('error', (error) => {
      console.error('Unexpected error on idle Postgres client', error);
    });
  }

  static get instance(): PostgresDatabase {
    if (!PostgresDatabase._instance) {
      throw 'PostgresDatabase not initialized';
    }
    return PostgresDatabase._instance;
  }

  static async connect(options: Options): Promise<PostgresDatabase> {
    const database = new PostgresDatabase(options);

    PostgresDatabase._instance = database;

    return database;
  }

  static async disconnect(): Promise<void> {
    await PostgresDatabase.instance.pool.end();
  }

  // Helper de transacción reutilizable: cualquier datasource que necesite
  // escribir en más de una tabla como una sola operación atómica (ej. un
  // agregado con relaciones propias, o el reemplazo de una tabla de
  // asociación M:N) pide un client aquí en vez de usar this.pool.query()
  // suelto por sentencia — dos queries sueltas contra el pool pueden caer en
  // conexiones distintas y no comparten transacción.
  async transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
