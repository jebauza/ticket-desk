# Development Guidelines

## Architectural Conventions

### Dependency Injection via Constructor
All classes receive dependencies through the constructor. No service locators or global imports of concrete classes inside domain.

```ts
// Service receives abstract repository + interface
export class TicketService {
  constructor(
    private readonly repository: TicketRepository,
    private readonly idManager: IdManager,
  ) {}
}

// Repository receives abstract datasource
export class TicketRepositoryImpl extends TicketRepository {
  constructor(private readonly datasource: TicketDatasource) { super(); }
}
```

### Composition Root in Routes
Concrete wiring happens only in `routes.ts` — never inside domain or service files.

```ts
// presentation/http/tickets/routes.ts
const datasource = new TicketDatasourceImpl();
const repository = new TicketRepositoryImpl(datasource);
const service = new TicketService(repository, UuidAdapter);
const controller = new TicketController(service);
```

### Singleton Pattern for Infrastructure
Both `PostgresDatabase` and `WssServer` use the same singleton pattern:
- Private static `_instance` field
- Private constructor
- Static `get instance()` throws if not initialized (fail-fast)
- Static `connect()` / `initWss()` factory method sets the instance

```ts
static get instance(): WssServer {
  if (!WssServer._instance) throw 'WssServer not initialized';
  return WssServer._instance;
}
```

### Options Interface for Constructors
Any class that takes multiple config params uses a local `interface Options` instead of positional args.

```ts
interface Options {
  server: Server;
  path?: string;
}
```

---

## Controller Pattern
- Controller methods are arrow function class properties (preserves `this` binding for Express)
- Every handler follows: validate params → try/catch → `next(error)` on failure
- Inline param validation before the try block; return early on invalid input

```ts
public drawTicket = async (req: Request, res: Response, next: NextFunction) => {
  const { desk } = req.params;
  if (typeof desk !== 'string') {
    res.status(400).json({ error: 'desk param is required' });
    return;
  }
  try {
    res.json(await this.service.drawTicket(desk));
  } catch (error) {
    next(error);
  }
};
```

---

## Error Handling

### CustomError (domain layer)
Static factory methods only — constructor is private.

```ts
throw CustomError.badRequest('Id is not a valid uuid');
throw CustomError.notFound('Ticket not found');
throw CustomError.internalServer('...');
```

### Repository Error Wrapping
Repository catches all datasource errors and re-throws as `CustomError`:

```ts
private handleError(error: unknown): CustomError {
  if (error instanceof CustomError) return error;
  console.error(error);
  return CustomError.internalServer('Ticket persistence error');
}
```

---

## Entity Pattern
- Plain class with public fields, no ORM decorators
- Static `fromObject` factory for deserialization with explicit field validation
- Computed getters for derived state (`isPending`)

```ts
static fromObject(object: { [key: string]: any }): TicketEntity {
  const { id, number, ... } = object;
  if (id === undefined) throw new Error('id is required');
  return new TicketEntity(...);
}
```

---

## Datasource / Repository Pattern
- Datasource: raw SQL via `pg` Pool, returns mapped entities
- All SQL results mapped through a dedicated `TicketMapper.fromRow(row)` static method
- Atomic operations use `FOR UPDATE SKIP LOCKED` to prevent race conditions on `drawNext`
- Repository adds a simple in-memory cache for `getAll`; mutating methods call `invalidateCache()`

---

## Environment Variables
Always use `env-var` with `.required()` and a type assertion method. Never read `process.env` directly.

```ts
PORT: get('PORT').required().asPortNumber(),
DB_HOST: get('DB_HOST').required().asString(),
```

---

## WebSocket Client (Frontend)
Auto-reconnect pattern: on `socket.onclose`, use `setTimeout` (1500 ms) to call the connect function recursively.

```js
socket.onclose = () => {
  setTimeout(() => connectToWebSockets(), 1500);
};
```

---

## Naming Conventions
| Artifact | Convention | Example |
|---|---|---|
| Files | `kebab-case` | `ticket.datasource.impl.ts` |
| Classes | `PascalCase` | `TicketDatasourceImpl` |
| Interfaces | `PascalCase` | `IdManager`, `Options` |
| Methods/props | `camelCase` | `getLastNumber`, `handleAtDesk` |
| DB columns | `snake_case` | `handle_at_desk`, `create_at` |
| Impl suffix | concrete classes | `TicketRepositoryImpl`, `TicketDatasourceImpl` |

---

## Code Style
- `private readonly` for all injected dependencies
- Trailing commas in multi-line constructor params and arrays
- No barrel `index.ts` files — import directly from the source file
- Abstract classes used for datasources and repositories (not interfaces) to allow `extends`
- Service methods that return nothing meaningful on mutation return `{ ok: true }` plain objects
