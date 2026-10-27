import { PaginationDto } from './pagination.dto';

export class PaginatedResult<T> {
  private constructor(
    public readonly items: T[],
    public readonly total: number,
    public readonly pagination: PaginationDto,
  ) {}

  static create<T>(items: T[], total: number, pagination: PaginationDto): PaginatedResult<T> {
    return new PaginatedResult(items, total, pagination);
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.pagination.limit);
  }

  get hasNext(): boolean {
    return this.pagination.offset + this.items.length < this.total;
  }

  get hasPrev(): boolean {
    return this.pagination.offset > 0;
  }

  map<R>(fn: (item: T) => R): PaginatedResult<R> {
    return new PaginatedResult(this.items.map(fn), this.total, this.pagination);
  }
}
