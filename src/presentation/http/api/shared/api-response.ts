export class ApiResponse {
  static success<T>(data: T, meta?: Record<string, unknown>) {
    return meta ? { data, meta } : { data };
  }

  static error(message: string) {
    return { error: message };
  }
}
