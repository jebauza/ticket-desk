import { HttpClientAdapter, HttpResponse } from '../../adapters/http-client.adapter';

interface Options {
  baseUrl: string;
  apiKey?: string;
}

export class ExternalApiClient {
  private static _instance: ExternalApiClient;
  private readonly baseUrl: string;
  private readonly apiKey: string | undefined;

  private constructor(options: Options) {
    this.baseUrl = options.baseUrl;
    this.apiKey = options.apiKey;
  }

  static get instance(): ExternalApiClient {
    if (!ExternalApiClient._instance) {
      throw 'ExternalApiClient not initialized';
    }
    return ExternalApiClient._instance;
  }

  static async connect(options: Options): Promise<ExternalApiClient> {
    const instance = new ExternalApiClient(options);
    ExternalApiClient._instance = instance;

    return instance;
  }

  static async disconnect(): Promise<void> {
    // Un cliente HTTP no mantiene una conexión persistente que cerrar;
    // se conserva el método para respetar el mismo contrato que las demás fuentes de datos.
  }

  private get authHeaders(): Record<string, string> {
    return this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {};
  }

  get<T>(path: string): Promise<HttpResponse<T>> {
    return HttpClientAdapter.get<T>(`${this.baseUrl}${path}`, { headers: this.authHeaders });
  }

  post<T>(path: string, body?: unknown): Promise<HttpResponse<T>> {
    return HttpClientAdapter.post<T>(`${this.baseUrl}${path}`, body, {
      headers: this.authHeaders,
    });
  }

  put<T>(path: string, body?: unknown): Promise<HttpResponse<T>> {
    return HttpClientAdapter.put<T>(`${this.baseUrl}${path}`, body, {
      headers: this.authHeaders,
    });
  }

  delete<T>(path: string): Promise<HttpResponse<T>> {
    return HttpClientAdapter.delete<T>(`${this.baseUrl}${path}`, { headers: this.authHeaders });
  }
}
