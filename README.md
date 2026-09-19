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
  infrastructure/   datasources (Postgres/Mongo/external API), repository impl, adapters, WebSocket
  presentation/
    http/           routes and controllers (composition root per feature)
    cli/            seed and migrate commands
```

Dependency rule is strict: `presentation` and `infrastructure` depend on `domain`; `domain` imports nothing from the other layers.

## REST Endpoints

All responses are wrapped as `{ "data": ... }`.

### Tickets — base path `/api/tickets`

| Method | Route                  | Description                                 |
|--------|------------------------|----------------------------------------------|
| GET    | `/`                    | All tickets                                  |
| GET    | `/pending`             | Pending tickets (not yet attended)           |
| GET    | `/last`                | The last created ticket                      |
| GET    | `/working-on`          | Last 4 tickets currently being attended      |
| POST   | `/`                    | Create a new ticket                          |
| GET    | `/:ticketId`            | A single ticket                              |
| PUT    | `/:ticketId`            | Update a ticket                              |
| DELETE | `/:ticketId`            | Delete a ticket                              |
| GET    | `/desk/current?desk=`  | Ticket currently being attended at a desk    |
| POST   | `/desk/next-ticket`    | Assign the next pending ticket to a desk     |
| PUT    | `/done/:ticketId`      | Mark a ticket as done                        |

### Auth — base path `/api/auth`

| Method | Route       | Auth | Description                        |
|--------|-------------|------|--------------------------------------|
| POST   | `/register` | —    | Create a user, returns `{ user, token }` |
| POST   | `/login`    | —    | Returns `{ user, token }`            |

### Users — base path `/api/users`

| Method | Route        | Auth   | Description                          |
|--------|--------------|--------|----------------------------------------|
| POST   | `/`          | —      | Create a user (no password/JWT flow)   |
| GET    | `/`          | Bearer | Paginated list (`?page=&limit=`)       |
| GET    | `/:userId`   | Bearer | A single user                          |
| PUT    | `/:userId`   | Bearer | Partial update                         |
| DELETE | `/:userId`   | Bearer | Delete                                 |

User responses never include `password`. Protected routes expect
`Authorization: Bearer <token>`.

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

**4. Run migrations**
```bash
npm run migrate
```

**5. Seed (optional)**
```bash
npm run seed
```

**6. Development**
```bash
npm run dev
```

**7. Production**
```bash
npm start
```

## Environment Variables

| Variable           | Description                              | Default      |
|---------------------|-------------------------------------------|--------------|
| `APP_PORT`          | HTTP server port                          | `3000`       |
| `DB_HOST`           | PostgreSQL host                           | `localhost`  |
| `DB_PORT`           | PostgreSQL port                           | `5432`       |
| `DB_NAME`           | Database name                             | `ticketdesk` |
| `DB_USER`           | PostgreSQL user                           | `postgres`   |
| `DB_PASSWORD`       | PostgreSQL password                       | `postgres`   |
| `JWT_SEED`          | Secret used to sign/verify JWTs           | —            |
| `JWT_EXPIRES_IN`    | Token lifetime                            | `2h`         |
| `MONGO_URL`         | Optional — only if a Mongo datasource is wired in | —    |
| `EXTERNAL_API_URL`  | Optional — only if the external-API datasource is wired in | — |

## Database

The docker-compose spins up PostgreSQL 16 with the default values from `.env.template`. Data is persisted in `./postgres/`.

Schema is managed with **migrations** (`node-pg-migrate`), not created by hand:

```bash
npm run migrate        # apply all pending migrations
npm run migrate:down   # revert the last migration
npm run migrate:create -- <name>   # scaffold a new .sql migration
```

Migration files live in `src/infrastructure/data/postgres/migrations/`, each with an
`-- Up Migration` / `-- Down Migration` section. `tickets` and `users` are both versioned
there — a fresh environment goes from an empty database to fully working with just
`docker-compose up -d && npm run migrate`.
