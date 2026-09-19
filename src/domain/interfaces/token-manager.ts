export interface TokenManager {
  generate(payload: Record<string, unknown>, duration?: string): Promise<string | null>;
  verify<T>(token: string): Promise<T | null>;
}
