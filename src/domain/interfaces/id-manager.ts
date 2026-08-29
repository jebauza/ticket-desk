export interface IdManager {
  generate(): string;
  isValid(id: string): boolean;
}
