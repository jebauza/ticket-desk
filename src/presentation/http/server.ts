import express, { Router } from 'express';
import helmet from 'helmet';
import path from 'path';
import { errorHandlerMiddleware } from './api/middlewares/error-handler.middleware';
import { apiRateLimiterMiddleware } from './api/middlewares/rate-limit.middleware';
import { sqlInjectionMiddleware } from './api/middlewares/sql-injection.middleware';

interface Options {
  port: number;
  public_path?: string;
}

export class Server {
  public readonly app = express();
  private serverListener?: any;
  private readonly port: number;
  private readonly publicPath: string;

  constructor(options: Options) {
    const { port, public_path = 'public' } = options;
    this.port = port;
    this.publicPath = public_path;

    this.configure();
  }

  private configure() {
    // fuerce al cliente a revalidar contra caché en vez de traer datos frescos.
    this.app.set('etag', false);

    // Detrás de un reverse proxy, sin esto req.ip es la IP del proxy para
    // todas las peticiones: el rate limit se vuelve un cupo global compartido
    // en vez de por cliente. Confía en un solo salto; súbelo si hay más.
    this.app.set('trust proxy', 1);

    this.app.use(helmet());
    this.app.use(apiRateLimiterMiddleware);
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(sqlInjectionMiddleware);

    this.app.use(express.static(this.publicPath));
  }

  private registerFallbacks() {
    // Únicamente si la ruta no empieza por /api, para no interceptar la API
    // con el fallback de SPA.
    this.app.get(/^\/(?!api).*/, (req, res) => {
      const indexPath = path.join(
        __dirname + `../../../../${this.publicPath}/index.html`,
      );
      res.sendFile(indexPath);
    });

    // Siempre al final: next(error) no llega aquí si se registra antes de las rutas.
    this.app.use(errorHandlerMiddleware);
  }

  public setRoutes(router: Router) {
    this.app.use(router);
    this.registerFallbacks();
  }

  // start()/close() no se usan: app.ts crea el http.Server con createServer(server.app)
  // y lo escucha directamente, porque WssServer necesita adjuntarse a ese mismo
  // http.Server para manejar el upgrade de WebSocket. Sin WSS, este sería el
  // método válido para levantar y cerrar el servidor.
  async start() {
    this.serverListener = this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }

  public close() {
    this.serverListener?.close();
  }
}
