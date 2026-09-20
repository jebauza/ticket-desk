import { randomUUID } from 'crypto';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class UuidAdapter {
  static generate(): string {
    return randomUUID();
  }

  static isValid(id: string): boolean {
    return UUID_REGEX.test(id);
  }
}
