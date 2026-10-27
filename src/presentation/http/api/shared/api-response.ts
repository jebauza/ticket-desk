import { PaginatedResult } from '../../../../domain/dtos/shared/paginated-result.dto';

export class ApiResponse {
  static success<T>(data: T, meta?: Record<string, unknown>) {
    return meta ? { data, meta } : { data };
  }

  // El meta devuelve las coordenadas con las que el cliente pidió la página: en modo offset
  // no se expone page/totalPages porque serían engañosos si offset no es múltiplo de limit.
  static paginated<T>(result: PaginatedResult<T>) {
    const { pagination, total, hasNext, hasPrev } = result;
    const position =
      pagination.mode === 'page'
        ? { page: pagination.page, limit: pagination.limit, total, totalPages: result.totalPages }
        : { offset: pagination.offset, limit: pagination.limit, total };

    return ApiResponse.success(result.items, { ...position, hasNext, hasPrev });
  }

  static error(message: string) {
    return { error: message };
  }
}
