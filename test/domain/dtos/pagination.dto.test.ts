import { PaginationDto } from '../../../src/domain/dtos/shared/pagination.dto';

describe('PaginationDto', () => {
  it('usa página 1 y limit por defecto sin parámetros', () => {
    const [error, dto] = PaginationDto.fromQuery({});

    expect(error).toBeUndefined();
    expect(dto).toMatchObject({ mode: 'page', offset: 0, limit: 10, page: 1 });
  });

  it('fromPage calcula el offset', () => {
    const [, dto] = PaginationDto.fromPage(3, 10);
    expect(dto!.offset).toBe(20);
  });

  it('fromOffset conserva el offset y el modo', () => {
    const [, dto] = PaginationDto.fromOffset(15, 10);
    expect(dto).toMatchObject({ mode: 'offset', offset: 15, limit: 10 });
  });

  it('fromQuery interpreta strings de query', () => {
    const [, byPage] = PaginationDto.fromQuery({ page: '2', limit: '5' });
    const [, byOffset] = PaginationDto.fromQuery({ offset: '7', limit: '5' });

    expect(byPage).toMatchObject({ mode: 'page', offset: 5, limit: 5 });
    expect(byOffset).toMatchObject({ mode: 'offset', offset: 7, limit: 5 });
  });

  it.each([
    [{ page: '0' }],
    [{ page: '1.5' }],
    [{ page: 'abc' }],
    [{ page: '' }],
    [{ page: ['1', '2'] }],
    [{ offset: '-1' }],
    [{ offset: '1.5' }],
    [{ limit: '0' }],
    [{ limit: '101' }],
    [{ limit: 'x' }],
  ])('rechaza %j', (query) => {
    const [error, dto] = PaginationDto.fromQuery(query);

    expect(error).toBeDefined();
    expect(dto).toBeUndefined();
  });

  it('acepta limit igual al máximo', () => {
    const [error] = PaginationDto.fromQuery({ limit: String(PaginationDto.MAX_LIMIT) });
    expect(error).toBeUndefined();
  });

  it('rechaza page y offset a la vez', () => {
    const [error] = PaginationDto.fromQuery({ page: '1', offset: '0' });
    expect(error).toBe('page and offset cannot be used together');
  });
});
