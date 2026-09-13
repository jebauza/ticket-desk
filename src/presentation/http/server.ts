import express, { Router } from 'express';
import path from 'path';
import { errorHandler } from './api/middlewares/error-handler.middleware';

interface Options {
  port: number;
  // routes: Router;
  public_path?: string;
}

export class Server {
  public readonly app = express();
  private serverListener?: any;
  private readonly port: number;
  private readonly publicPath: string;
  // private readonly routes: Router;

  constructor(options: Options) {
    const { port, /* routes, */ public_path = 'public' } = options;
    this.port = port;
    this.publicPath = public_path;
    // this.routes = routes;

    this.configure();
  }

  private configure() {
    //* Middlewares
    this.app.use(express.json()); // raw
    this.app.use(express.urlencoded({ extended: true })); // x-www-form-urlencoded

    //* Public Folder
    this.app.use(express.static(this.publicPath));

    //* Routes
    // this.app.use(this.routes);
  }

  private registerFallbacks() {
    //* SPA /^\/(?!api).*/  <== Únicamente si no empieza con la palabra api
    this.app.get(/^\/(?!api).*/, (req, res) => {
      const indexPath = path.join(
        __dirname + `../../../../${this.publicPath}/index.html`,
      );
      res.sendFile(indexPath);
    });

    //* Error handler (siempre al final)
    this.app.use(errorHandler);
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
