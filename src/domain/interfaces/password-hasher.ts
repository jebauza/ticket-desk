export interface PasswordHasher {
  hash(plainPassword: string): string;
  compare(plainPassword: string, hashedPassword: string): boolean;
}
