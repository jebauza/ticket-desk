import { compareSync, hashSync } from 'bcryptjs';

export class BcryptAdapter {
  static hash(plainPassword: string): string {
    return hashSync(plainPassword);
  }

  static compare(plainPassword: string, hashedPassword: string): boolean {
    return compareSync(plainPassword, hashedPassword);
  }
}
