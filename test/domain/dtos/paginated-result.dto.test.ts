import { PaginatedResult } from '../../../src/domain/dtos/shared/paginated-result.dto';
import { PaginationDto } from '../../../src/domain/dtos/shared/pagination.dto';

function pagination(page: number, limit: number): PaginationDto {
  return PaginationDto.fromPage(page, limit)[1]!;
}

describe('PaginatedResult', () => {
  it('calcula totalPages, hasNext y hasPrev en una página intermedia', () => {
    const result = PaginatedResult.create([1, 2], 5, pagination(2, 2));

    expect(result.totalPages).toBe(3);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrev).toBe(true);
  });

  it('última página: sin siguiente', () => {
    const result = PaginatedResult.create([5], 5, pagination(3, 2));
    expect(result.hasNext).toBe(false);
  });

  it('total 0: sin páginas ni navegación', () => {
    const result = PaginatedResult.create([], 0, pagination(1, 10));

    expect(result.totalPages).toBe(0);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrev).toBe(false);
  });

  it('página fuera de rango: sin items, sin siguiente, con anterior', () => {
    const result = PaginatedResult.create([], 5, pagination(999, 10));

    expect(result.hasNext).toBe(false);
    expect(result.hasPrev).toBe(true);
    expect(result.total).toBe(5);
  });

  it('map transforma los items y conserva total y paginación', () => {
    const source = PaginatedResult.create([1, 2], 7, pagination(1, 2));
    const mapped = source.map((n) => `#${n}`);

    expect(mapped.items).toEqual(['#1', '#2']);
    expect(mapped.total).toBe(7);
    expect(mapped.pagination).toBe(source.pagination);
  });
});
