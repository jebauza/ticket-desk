export type PaginationMode = 'page' | 'offset';
export type PaginationResult = [string | undefined, PaginationDto | undefined];

interface PaginationQuery {
  page?: unknown;
  offset?: unknown;
  limit?: unknown;
}

// Ambos estilos de petición (page/limit y offset/limit) se normalizan a offset + limit:
// los datasources solo conocen esa forma. `mode` se conserva únicamente para que la
// respuesta devuelva al cliente las mismas coordenadas que usó.
export class PaginationDto {
  static readonly DEFAULT_LIMIT = 10;
  static readonly MAX_LIMIT = 100;

  private constructor(
    public readonly mode: PaginationMode,
    public readonly offset: number,
    public readonly limit: number,
  ) {}

  // Con offset no múltiplo de limit es aproximado; solo es exacto en modo 'page'.
  get page(): number {
    return Math.floor(this.offset / this.limit) + 1;
  }

  static fromPage(
    page: number = 1,
    limit: number = PaginationDto.DEFAULT_LIMIT,
  ): PaginationResult {
    if (!Number.isInteger(page) || page < 1) return ['page must be a positive integer', undefined];
    const limitError = PaginationDto.validateLimit(limit);
    if (limitError) return [limitError, undefined];

    return [undefined, new PaginationDto('page', (page - 1) * limit, limit)];
  }

  static fromOffset(
    offset: number = 0,
    limit: number = PaginationDto.DEFAULT_LIMIT,
  ): PaginationResult {
    if (!Number.isInteger(offset) || offset < 0) {
      return ['offset must be a non-negative integer', undefined];
    }
    const limitError = PaginationDto.validateLimit(limit);
    if (limitError) return [limitError, undefined];

    return [undefined, new PaginationDto('offset', offset, limit)];
  }

  // Entrada desde HTTP: query params crudos. `page` y `offset` a la vez es ambiguo → error.
  static fromQuery(query: PaginationQuery): PaginationResult {
    const { page, offset, limit } = query;

    if (page !== undefined && offset !== undefined) {
      return ['page and offset cannot be used together', undefined];
    }

    const parsedLimit = PaginationDto.parse(limit, PaginationDto.DEFAULT_LIMIT);
    if (offset !== undefined) {
      return PaginationDto.fromOffset(PaginationDto.parse(offset, 0), parsedLimit);
    }

    return PaginationDto.fromPage(PaginationDto.parse(page, 1), parsedLimit);
  }

  private static validateLimit(limit: number): string | undefined {
    if (!Number.isInteger(limit) || limit < 1) return 'limit must be a positive integer';
    if (limit > PaginationDto.MAX_LIMIT) {
      return `limit must not exceed ${PaginationDto.MAX_LIMIT}`;
    }
    return undefined;
  }

  // '' y valores no escalares (page=1&page=2 llega como array) dan NaN → los rechaza el validador.
  private static parse(value: unknown, fallback: number): number {
    if (value === undefined) return fallback;
    if (typeof value !== 'string' || value.trim() === '') return NaN;
    return Number(value);
  }
}
