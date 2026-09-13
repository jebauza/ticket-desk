# Technology Stack

## Runtime & Language
- Node.js (LTS)
- TypeScript 6.x — strict mode, `nodenext` module, `esnext` target
- `isolatedModules`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` enabled

## Core Dependencies
| Package | Version | Role |
|---|---|---|
| express | ^5.2.1 | HTTP server (Express 5) |
| ws | ^8.21.3 | WebSocket server |
| pg | ^8.23.0 | PostgreSQL client (Pool) |
| mongodb | ^7.6.0 | MongoDB client (alternative datasource) |
| uuid | ^14.0.2 | ID generation |
| dotenv | ^17.4.2 | .env loading |
| env-var | ^7.5.0 | Typed, validated env variables |

## Dev Dependencies
| Package | Role |
|---|---|
| ts-node-dev | Hot-reload dev server (`tsnd --respawn`) |
| typescript | Compiler |
| rimraf | Clean dist before build |
| @types/express, @types/pg, @types/ws, @types/node | Type definitions |

## Database
- PostgreSQL 16 via Docker (`docker-compose.yml`)
- Connection managed as singleton `Pool` in `PostgresDatabase`
- Data persisted in `./postgres/` volume

## Environment Variables
Validated at startup via `env-var` — app crashes fast if any are missing.

| Variable | Description |
|---|---|
| `PORT` | HTTP server port |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `DB_NAME` | Database name |
| `DB_USER` | PostgreSQL user |
| `DB_PASSWORD` | PostgreSQL password |

## NPM Scripts
```bash
npm run dev    # ts-node-dev --respawn src/app.ts
npm run seed   # ts-node src/presentation/cli/ticket.seed.command.ts
npm run build  # rimraf dist && tsc -p tsconfig.build.json
npm start      # build + node dist/app.js
```

## Setup Sequence
```bash
cp .env.template .env
docker-compose up -d
npm install
npm run seed   # optional
npm run dev
```
