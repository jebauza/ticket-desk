export class HttpClient {
  static async get(url, params = {}, headers = {}) {
    const fullUrl = new URL(url, window.location.origin);

    for (const [key, value] of Object.entries(params)) {
      if (!fullUrl.searchParams.has(key)) {
        fullUrl.searchParams.set(key, value);
      }
    }

    return HttpClient.#request(fullUrl.toString(), { method: 'GET', headers });
  }

  static async post(url, body, headers = {}) {
    return HttpClient.#request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  static async #request(url, options) {
    const res = await fetch(url, options);
    const body = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(body?.error ?? `Request failed (${res.status})`);
    }

    return {
      status: res.status,
      headers: Object.fromEntries(res.headers),
      body
    };
  }
}
