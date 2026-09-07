import { TicketEntity } from '../../../../domain/entities/ticket.entity';
import { TicketDatasource } from '../../../../domain/datasources/ticket.datasource';
import { ExternalApiClient } from '../external-api.client';
import { TicketApiMapper, TicketApiResponse } from './ticket.api.mapper';

// Endpoints asumidos, ilustrativos: ajustar rutas y payloads al contrato
// real de la API externa que se integre. La mecánica HTTP en sí (fetch,
// axios, lo que sea) queda encapsulada en HttpClientAdapter.
export class TicketDatasourceImpl extends TicketDatasource {
  private get client() {
    return ExternalApiClient.instance;
  }

  async getAll(): Promise<TicketEntity[]> {
    const { data } = await this.client.get<TicketApiResponse[]>('/tickets');
    return data.map(TicketApiMapper.fromResponse);
  }

  async getPending(): Promise<TicketEntity[]> {
    const { data } = await this.client.get<TicketApiResponse[]>('/tickets/pending');
    return data.map(TicketApiMapper.fromResponse);
  }

  async getLastNumber(): Promise<number> {
    const { data } = await this.client.get<{ lastNumber: number }>('/tickets/last');
    return data.lastNumber;
  }

  async getWorkingOn(limit: number): Promise<TicketEntity[]> {
    const { data } = await this.client.get<TicketApiResponse[]>(
      `/tickets/working-on?limit=${limit}`,
    );
    return data.map(TicketApiMapper.fromResponse);
  }

  async create(id: string): Promise<TicketEntity> {
    const { data } = await this.client.post<TicketApiResponse>('/tickets', { id });
    return TicketApiMapper.fromResponse(data);
  }

  async drawNext(desk: string): Promise<TicketEntity | null> {
    const { data } = await this.client.post<TicketApiResponse | null>('/tickets/draw', { desk });
    return data ? TicketApiMapper.fromResponse(data) : null;
  }

  async markAsDone(id: string): Promise<TicketEntity | null> {
    const { data } = await this.client.put<TicketApiResponse | null>(`/tickets/${id}/done`);
    return data ? TicketApiMapper.fromResponse(data) : null;
  }

  async countAll(): Promise<number> {
    const { data } = await this.client.get<{ count: number }>('/tickets/count');
    return data.count;
  }

  async seed(tickets: TicketEntity[]): Promise<void> {
    await this.client.post<void>('/tickets/seed', tickets);
  }
}
