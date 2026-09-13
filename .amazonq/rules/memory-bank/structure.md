# Project Structure

## Directory Layout
```
src/
  app.ts                          # Entry point: DB connect, HTTP server, WSS init
  config/
    envs.ts                       # env-var validated environment variables
  domain/                         # Pure business logic — no framework imports
    datasources/
      ticket.datasource.ts        # Abstract datasource interface
    entities/
      ticket.entity.ts            # TicketEntity class with fromObject factory
    errors/
      custom.error.ts             # CustomError with static factory methods
    interfaces/
      id-manager.ts               # IdManager interface
    repositories/
      ticket.repository.ts        # Abstract repository interface
    services/
      ticket.service.ts           # Business logic orchestration
  infrastructure/                 # Concrete implementations
    adapters/
      uuid.adapter.ts             # UuidAdapter implements IdManager
      http-client.adapter.ts      # HTTP client wrapper
    data/
      postgres/
        postgres.database.ts      # Singleton Pool connection
        tickets/
          ticket.datasource.impl.ts   # SQL queries via pg Pool
          ticket.postgres.mapper.ts   # DB row → TicketEntity
      mongo/
        mongo.database.ts         # MongoDB connection (alternative datasource)
        tickets/                  # Mongo datasource impl
      external-api/
        external-api.client.ts    # External API datasource
        tickets/
    repositories/
      tickets/
        ticket.repository.impl.ts # Delegates to datasource
    websocket/
      wss.server.ts               # Singleton WssServer wrapping ws
  presentation/
    http/
      server.ts                   # Express app setup
      routes.ts                   # Top-level router
      tickets/
        routes.ts                 # /api/tickets sub-router
        controller.ts             # Request handlers
      middlewares/
        error-handler.middleware.ts
    cli/
      ticket.seed.command.ts      # Seed script

public/                           # Static frontend
  index.html / desk.html / new-ticket.html / public.html
  js/
    socket-client.js              # Shared WS client helper
    desk.js / new-ticket.js / public.js
```

## Architectural Pattern
Clean / Layered Architecture with strict dependency rule:

```
presentation ──▶ domain ◀── infrastructure
```

- `domain` has zero external dependencies
- `infrastructure` implements domain abstractions
- `presentation` wires everything together (composition root in controllers/routes)

## Core Relationships
- `TicketDatasourceImpl` extends abstract `TicketDatasource`
- `TicketRepositoryImpl` wraps a `TicketDatasource` instance
- `TicketService` receives a `TicketRepository` (injected)
- `TicketController` instantiates service + repository + datasource
- `WssServer` is a singleton; controllers call `WssServer.instance.broadcast()`
- `PostgresDatabase` is a singleton accessed via `PostgresDatabase.instance.pool`
