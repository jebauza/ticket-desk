export class HttpClient {
  static async get(url, headers = {}) {
    return HttpClient.#request(url, { method: 'GET', headers });
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
    const payload = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(payload?.error ?? `Request failed (${res.status})`);
    }

    return payload?.data;
  }
}
