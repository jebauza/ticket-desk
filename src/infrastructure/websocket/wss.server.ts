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
    });
  }
}
