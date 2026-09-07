import { envs } from '../../config/envs';
import { PostgresDatabase } from '../../infrastructure/data/postgres/postgres.database';
import { TicketDatasourceImpl } from '../../infrastructure/data/postgres/tickets/ticket.datasource.impl';
import { TicketRepositoryImpl } from '../../infrastructure/repositories/tickets/ticket.repository.impl';
import { TicketService } from '../../domain/services/ticket.service';
import { UuidAdapter } from '../../infrastructure/adapters/uuid.adapter';

(async () => {
  await main();
})();

async function main() {
  await PostgresDatabase.connect({
    host: envs.DB_HOST,
    port: envs.DB_PORT,
    database: envs.DB_NAME,
    user: envs.DB_USER,
    password: envs.DB_PASSWORD,
  });

  const datasource = new TicketDatasourceImpl();
  const repository = new TicketRepositoryImpl(datasource);
  const service = new TicketService(repository, UuidAdapter);

  await service.seedTickets();

  console.log('Seed finished');
  process.exit(0);
}
