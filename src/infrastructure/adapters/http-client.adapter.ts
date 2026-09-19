interface HttpClientOptions {
  headers?: Record<string, string>;
}

export interface HttpResponse<T> {
  status: number;
  headers: Record<string, string>;
  data: T;
}

export class HttpClientAdapter {
  static get<T>(
    url: string,
    options?: HttpClientOptions,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, 'GET', undefined, options);
  }

  static post<T>(
    url: string,
    body?: unknown,
    options?: HttpClientOptions,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, 'POST', body, options);
  }

  static put<T>(
    url: string,
    body?: unknown,
    options?: HttpClientOptions,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, 'PUT', body, options);
  }

  static delete<T>(
    url: string,
    options?: HttpClientOptions,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, 'DELETE', undefined, options);
  }

  private static async request<T>(
    url: string,
    method: string,
    body: unknown,
    options?: HttpClientOptions,
  ): Promise<HttpResponse<T>> {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} calling ${method} ${url}`);
    }

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const raw = await response.text();
    const data = (raw ? JSON.parse(raw) : null) as T;

    return { status: response.status, headers, data };
  }
}
