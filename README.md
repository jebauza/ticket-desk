# Ticket Desk

Queue management system with a real-time web interface. Customers generate numbered tickets, desks attend them one by one, and a public display shows the current state via WebSockets.

## Stack

- **Runtime**: Node.js + TypeScript
- **HTTP**: Express 5
- **WebSockets**: ws
- **Database**: PostgreSQL 16 (via `pg`)
- **Container**: Docker / docker-compose

## Architecture

Layered architecture (clean architecture):

```
src/
  config/           validated environment variables
  domain/           entities, repositories (abstract), services, errors
  infrastructure/   datasources (Postgres), repository impl, adapters, WebSocket
  presentation/
    http/           routes and controllers (composition root per feature)
    cli/            seed command
```

Dependency rule is strict: `presentation` and `infrastructure` depend on `domain`; `domain` imports nothing from the other layers.

## REST Endpoints

Base path: `/api/tickets`

| Method | Route             | Description                                      |
|--------|-------------------|--------------------------------------------------|
| GET    | `/`               | All tickets                                      |
| GET    | `/pending`        | Pending tickets (not yet attended)               |
| GET    | `/last`           | Number of the last created ticket                |
| GET    | `/working-on`     | Last 4 tickets currently being attended          |
| POST   | `/`               | Create a new ticket                              |
| GET    | `/draw/:desk`     | Assign the next pending ticket to a desk         |
| PUT    | `/done/:ticketId` | Mark a ticket as done                            |

## Web Views

Served as static files from `public/`:

| Route              | Description                                              |
|--------------------|----------------------------------------------------------|
| `/`                | Main menu (access to desk and public display)            |
| `/public.html`     | Public display — shows tickets being attended in real time |
| `/new-ticket.html` | Generate a new ticket                                    |
| `/desk.html`       | Desk view — call and finish tickets                      |

## Setup

**1. Environment variables**
```bash
cp .env.template .env
```

**2. Start the database**
```bash
docker-compose up -d
```

**3. Install dependencies**
```bash
npm install
```

**4. Seed (optional)**
```bash
npm run seed
```

**5. Development**
```bash
npm run dev
```

**6. Production**
```bash
npm start
```

## Environment Variables

| Variable      | Description              | Default      |
|---------------|--------------------------|--------------|
| `PORT`        | HTTP server port         | `3000`       |
| `DB_HOST`     | PostgreSQL host          | `localhost`  |
| `DB_PORT`     | PostgreSQL port          | `5432`       |
| `DB_NAME`     | Database name            | `ticketdesk` |
| `DB_USER`     | PostgreSQL user          | `postgres`   |
| `DB_PASSWORD` | PostgreSQL password      | `postgres`   |

## Database

The docker-compose spins up PostgreSQL 16 with the default values from `.env.template`. Data is persisted in `./postgres/`.

The `tickets` table is expected with columns: `id`, `number`, `create_at`, `handle_at_desk`, `handle_at`, `done`.
