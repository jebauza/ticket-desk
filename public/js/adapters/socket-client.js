export class SocketClient {
  #url;
  #socket = null;
  #reconnectDelay;
  #shouldReconnect = true;
  #listeners = new Map();

  constructor(url, { reconnectDelay = 1500 } = {}) {
    this.#url = url;
    this.#reconnectDelay = reconnectDelay;
  }

  connect() {
    this.#shouldReconnect = true;
    this.#open();
    return this;
  }

  disconnect() {
    this.#shouldReconnect = false;
    this.#socket?.close();
  }

  on(event, handler) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, new Set());
    }
    this.#listeners.get(event).add(handler);
    return this;
  }

  off(event, handler) {
    this.#listeners.get(event)?.delete(handler);
    return this;
  }

  send(data) {
    this.#socket?.send(typeof data === 'string' ? data : JSON.stringify(data));
  }

  #open() {
    const socket = new WebSocket(this.#url);
    this.#socket = socket;

    socket.onopen = () => this.#emit('open');

    socket.onmessage = (event) => this.#emit('message', event.data);

    socket.onclose = () => {
      this.#emit('close');
      if (this.#shouldReconnect) {
        setTimeout(() => this.#open(), this.#reconnectDelay);
      }
    };

    socket.onerror = (event) => this.#emit('error', event);
  }

  #emit(event, payload) {
    this.#listeners.get(event)?.forEach((handler) => handler(payload));
  }
}
