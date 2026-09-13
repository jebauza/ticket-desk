import { Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';

interface Options {
  server: Server;
  path?: string; // ws
}

export class WssServer {
  private static _instance: WssServer;
  private wss: WebSocketServer;

  private constructor(options: Options) {
    const { server, path } = options;
    this.wss = new WebSocketServer({ server, path });
    this.start();

    server.once('listening', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : '';
      console.log(
        `WebSocket server listening on ws://localhost:${port}${path ?? ''}`,
      );
    });
  }

  static get instance(): WssServer {
    if (!WssServer._instance) {
      throw 'WssServer not initialized';
    }
    return WssServer._instance;
  }

  static initWss(options: Options) {
    WssServer._instance = new WssServer(options);
  }

  public start() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('Client connected');
      ws.on('close', () => console.log('Client disconnected'));
      ws.on('error', (error) =>
        console.error('WebSocket client error:', error),
      );
    });
  }

  public broadcast(event: string, payload?: unknown) {
    const message = JSON.stringify({ event, payload });
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}
