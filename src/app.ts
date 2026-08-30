import { createServer } from 'http';
import { envs } from './config/envs';
import { AppRoutes } from './presentation/http/routes';
import { Server } from './presentation/http/server';
import { WssServer } from './infrastructure/websocket/wss.server';
import { PostgresDatabase } from './infrastructure/data/postgres/postgres.database';

(async () => {
  await main();
})();

async function main() {
  await PostgresDatabase.connect({
    host: envs.DB_HOST,
    port: envs.DB_PORT,
    database: envs.DB_NAME,
    user: envs.DB_USER,
    password: envs.DB_PASSWORD,
  });
  console.log('Postgres connected');

  const server = new Server({
    port: envs.PORT,
    // routes: AppRoutes.routes,
  });

  const httpServer = createServer(server.app);
  WssServer.initWss({ server: httpServer });

  server.setRoutes(AppRoutes.routes);

  httpServer.listen(envs.PORT, () => {
    console.log(`Server running on port ${envs.PORT}`);
  });
}
