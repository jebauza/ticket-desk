export class ApiResponse {
  static success<T>(data: T, meta?: Record<string, unknown>) {
    return meta ? { data, meta } : { data };
  }
}
