import path from 'path';
import { runner } from 'node-pg-migrate';
import { envs } from '../../config/envs';

// Composition root de las migraciones: usan las mismas credenciales validadas
// por envs.ts (DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD) en vez de un
// DATABASE_URL separado que podría desincronizarse de la config real.
//
// Uso: ts-node src/presentation/cli/migrate.command.ts up | down
(async () => {
  await main();
})().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});

async function main() {
  const direction = parseDirection(process.argv[2]);

  await runner({
    direction,
    databaseUrl: {
      host: envs.DB_HOST,
      port: envs.DB_PORT,
      database: envs.DB_NAME,
      user: envs.DB_USER,
      password: envs.DB_PASSWORD,
    },
    dir: path.join(__dirname, '../../infrastructure/data/postgres/migrations'),
    migrationsTable: 'pgmigrations',
    // Cada migración es un archivo .sql con secciones "-- Up" / "-- Down",
    // así el esquema se define en SQL puro y no en la API programática.
    // count: undefined => aplica/revierte todas las pendientes en 'up',
    // pero solo la última en 'down' (comportamiento por defecto de la lib).
    count: direction === 'down' ? 1 : Infinity,
  });

  console.log(`Migrations (${direction}) finished`);
  process.exit(0);
}

function parseDirection(arg: string | undefined): 'up' | 'down' {
  if (arg !== 'up' && arg !== 'down') {
    throw new Error(`Usage: migrate.command.ts <up|down>, got "${arg}"`);
  }
  return arg;
}
