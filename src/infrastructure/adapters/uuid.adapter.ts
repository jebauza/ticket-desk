import { v4 as uuidv4, validate } from 'uuid';

export class UuidAdapter {
  static generate(): string {
    return uuidv4();
  }

  static isValid(id: string): boolean {
    return validate(id);
  }
}
