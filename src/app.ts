import { createServer } from 'http';
import { envs } from './config/envs';
import { ApiRoutes } from './presentation/http/api/routes';
import { Server } from './presentation/http/server';
import { WssServer } from './infrastructure/websocket/wss.server';
import { PostgresDatabase } from './infrastructure/data/postgres/postgres.database';

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

(async () => {
  await main();
})().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

async function main() {
  await PostgresDatabase.connect({
    host: envs.DB_HOST,
    port: envs.DB_PORT,
    database: envs.DB_NAME,
    user: envs.DB_USER,
    password: envs.DB_PASSWORD,
  });
  console.log(
    `Postgres connected: postgresql://${envs.DB_HOST}:${envs.DB_PORT}/${envs.DB_NAME}`,
  );

  const server = new Server({
    port: envs.PORT,
    // routes: ApiRoutes.routes,
  });

  const httpServer = createServer(server.app);
  WssServer.initWss({ server: httpServer });

  server.setRoutes(ApiRoutes.routes);

  httpServer.listen(envs.PORT, () => {
    console.log(`API listening on http://localhost:${envs.PORT}/api`);
  });
}
