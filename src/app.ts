import { createServer } from 'http';
import { envs } from './config/envs';
import { AppRoutes } from './presentation/http/routes';
import { Server } from './presentation/http/server';
import { WssServer } from './infrastructure/websocket/wss.server';

(async () => {
  main();
})();

function main() {
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
