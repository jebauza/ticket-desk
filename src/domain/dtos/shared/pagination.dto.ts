export class PaginationDto {
  private constructor(
    public page: number,
    public limit: number,
  ) {}

  static create(
    page: number = 1,
    limit: number = 10,
  ): [string | undefined, PaginationDto | undefined] {
    if (isNaN(page) || page <= 0) return ['page must be a positive integer', undefined];
    if (isNaN(limit) || limit <= 0) return ['limit must be a positive integer', undefined];

    return [undefined, new PaginationDto(page, limit)];
  }
}
