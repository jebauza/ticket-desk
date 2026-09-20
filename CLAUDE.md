# Arquitectura y reglas de desarrollo

> Este fichero es portable: la Parte A se copia tal cual a proyectos nuevos que sigan este mismo
> patrón. La Parte B es específica de este repo y se reemplaza al copiar. Documento hermano:
> skill `node-clean-architecture` (plantillas de código, bootstrap, migración de legacy) — este
> fichero fija las reglas; la skill explica el porqué con ejemplos largos.

## Parte A — Reglas del patrón (portable)

> Dos sentidos de "migración" en este documento: **migración de esquema** (§8bis) es un cambio
> versionado de la base de datos; **migración de arquitectura** (§12) es llevar un proyecto legacy
> a este patrón. No se usan como sinónimos.

### 1. Arquitectura

Tres capas, las flechas de import solo apuntan hacia adentro:

```
presentation/  →  domain/
infrastructure/ →  domain/
domain/         →  (nada fuera de sí mismo)
```

`domain/` nunca importa de `infrastructure/` ni `presentation/`. Criterio verificable: `domain/`
debe compilar sin Express, `pg`, `ws` ni ninguna librería de infraestructura instalada.

### 2. Estructura de carpetas

```
src/
  config/envs.ts          variables de entorno validadas (env-var, .required())
  domain/
    entities/              <entity>.entity.ts
    datasources/            <entity>.datasource.ts      (puerto, abstract class)
    repositories/           <entity>.repository.ts      (puerto, abstract class)
    services/               <entity>.service.ts
    dtos/<entidad>/{request,response}/*.dto.ts
    interfaces/             capacidades técnicas (interface, no abstract class)
    errors/custom.error.ts
  infrastructure/
    data/<tech>/<entidad>/  <entity>.datasource.impl.ts + <entity>.mapper.ts
    data/<tech>/<tech>.database.ts   pool/cliente compartido, singleton
    data/<tech>/migrations/  <timestamp>_<verbo>-<objeto>.sql  (ver §8bis)
    repositories/<entidad>/<entity>.repository.impl.ts
    adapters/               utilidades técnicas de rol único (uuid, bcrypt, jwt, http-client)
  presentation/
    http/server.ts + http/api/<feature>/{routes,controller}.ts + presenters/
    cli/<algo>.command.ts   composition root de comando
  app.ts                    conecta infra compartida y arranca; no conoce features
```

### 3. Dónde va cada contrato

**Los puertos (`abstract class` para repositorios/datasources, `interface` para capacidades
técnicas) viven en `domain/`. Las implementaciones concretas viven en `infrastructure/`.** La
pregunta para decidir: ¿es una capacidad que el dominio necesita del mundo exterior para cumplir
una regla de negocio? → puerto en `domain/`. ¿Es infraestructura hablándose a sí misma? → adapter
en `infrastructure/adapters/`.

### 4. Convenciones de nombres

`<entity>.entity.{ts,js}`, `<entity>.repository.{ts,js}`, `<entity>.datasource.{ts,js}`,
`<entity>.datasource.impl.{ts,js}`, `<entity>.mapper.{ts,js}`, `<entity>.presenter.{ts,js}`,
`*.dto.{ts,js}`, `<algo>.command.{ts,js}`. La extensión la fija el lenguaje del proyecto (ver §10bis
para la dualidad TS/JS); la convención de nombre no cambia. La tecnología (postgres, mongo,
external-api...) es **carpeta**, nunca sufijo de fichero — el datasource concreto se llama
`<entity>.datasource.impl.*` en todas.

### 5. Construcción de objetos

- Entidades y DTOs: constructor **privado** + factory estática (`create()`). Un objeto solo existe
  si es válido — nunca se revalida en una capa posterior.
- Los ids los genera siempre el servicio (vía el puerto de id inyectado), nunca la entidad ni el
  mapper.
- Los mappers reshapean columnas/documentos y **nunca** validan — delegan en `Entity.create()`.
- DTOs de request devuelven tupla `[error, dto]`, no lanzan excepción.

### 6. Reglas por capa

| Capa | Sí | No |
|---|---|---|
| Entidad | invariantes, getters derivados | conocer HTTP, SQL, ni otra capa |
| Servicio | reglas de negocio, orquestar puertos | saber de Express ni de SQL |
| Repository | caché, traducir errores a `CustomError` | saber la tecnología concreta |
| Datasource | su tecnología concreta | reglas de negocio |
| Controller | parsear input → llamar servicio → mapear salida | lógica de negocio |
| Dominio (general) | recibir todo por constructor | devolver una entidad con secretos hacia arriba |

### 7. Patrones en uso

Repository, Strategy (datasources intercambiables tras un puerto), Adapter, Data Mapper, DTO,
Presenter, Factory Method (`Entity.create()`), Singleton (`*.database.ts`), Observer/Pub-Sub
(notificador de tiempo real), Dependency Injection por constructor, Composition Root
(`<feature>/routes.ts`). Nómbralos cuando aclaran una decisión, no por decorar — no crees una clase
con tres sufijos de patrón porque el catálogo exista.

### 8. Seguridad

- SQL **siempre** con placeholders (`$1, $2...`) + array de valores; nunca `${}` ni concatenación
  dentro del texto de una query. Identificadores dinámicos (`ORDER BY`, nombre de columna) contra
  **lista blanca**, nunca parametrizados con `$1`.
- El payload de un token de sesión lleva solo el id; el middleware de auth **recarga el usuario
  desde la BD en cada request** — no confía en el payload, así un usuario borrado o degradado
  pierde acceso al instante.
- Los servicios devuelven DTOs de response, nunca entidades con campos sensibles.
- Errores de autenticación con mensaje genérico (mismo mensaje si el usuario no existe o si la
  contraseña falla) — nunca permitir enumerar cuentas.
- El error handler no expone detalles internos: error de dominio conocido → su mensaje y status;
  cualquier otro → 500 genérico, detalle solo en el log. Nunca loguear el body de un request.
- Hash de contraseñas **asíncrono**, con cost factor explícito.
- `helmet()`, rate limiting, y `trust proxy` configurado si hay un reverse proxy delante.
- Secretos vía variables de entorno validadas (`.required()` + longitud mínima donde aplique);
  nunca hardcodeados ni logueados.
- Todo middleware de seguridad que se define se monta en al menos una ruta — uno definido y sin
  montar es peor que no tenerlo.

### 8bis. Migraciones de esquema

- Viven en `infrastructure/data/<tech>/migrations/` — son infraestructura de una tecnología
  concreta, nunca de `domain/`.
- Nombre `<timestamp>_<verbo>-<objeto>.sql` (ej. `1700000003000_create-tickets.sql`); el orden
  lexicográfico del nombre es el orden de aplicación.
- SQL puro con secciones `-- Up Migration` / `-- Down Migration`, no la API programática de la
  librería de migraciones — el esquema queda legible sin ejecutar nada. `-- Down` es obligatoria y
  deshace en orden inverso (índices antes que la tabla).
- **Una migración ya aplicada es inmutable**: un cambio posterior es una migración nueva, nunca una
  edición de la anterior — editarla deja divergentes los entornos que ya la corrieron.
- Constraints e índices con **nombre explícito** (`PK_<tabla>_<col>`, `IDX_<tabla>_<cols>`), para
  poder revertirlos por nombre en el `-- Down`; un comentario indica qué consulta acelera cada
  índice.
- El runner de migraciones es un composition root en `presentation/cli/<algo>.command.ts`, y
  reutiliza el mismo `config/envs.ts` validado que la app — nunca un `DATABASE_URL` paralelo que
  puede desincronizarse de la config real.
- **Migración ≠ seed**: la migración define estructura, el seed inserta datos de ejemplo — comandos
  y ficheros separados.
- Nunca `sync()` / `db push` de un ORM como mecanismo de esquema en un entorno compartido o de
  producción.
- Columnas en `snake_case`; el desfase con la entidad lo resuelve el mapper, nunca un alias en la
  query ni un rename en la entidad.
- La suite de tests **no** ejecuta migraciones — sigue corriendo sin base de datos (§9).

### 9. Tests

- Jest (con ts-jest en TS; Jest plano o babel-jest en JS), supertest para rutas HTTP. La suite corre
  **sin base de datos**.
- Dobles escritos a mano sobre los puertos de dominio (`extends` la abstract class, u objeto
  literal para una interface) — no `jest.mock()` de módulos. Si un test necesita `jest.mock()`,
  normalmente falta una inyección, no una herramienta.
- Un feature no está terminado sin tests de su entidad, sus DTOs y su servicio.
- `npm test` debe quedar verde antes de dar un cambio por terminado — y no sustituye la
  comprobación real contra el servidor levantado.

### 10. Comentarios

> Los nombres cargan la explicación. Un comentario solo se justifica si dice algo que el código no
> puede decir por sí mismo.
>
> **Comenta**: invariantes que no se ven en la firma; decisiones de seguridad y su motivo;
> restricciones de orden; comportamiento contraintuitivo de una librería; el motivo de una
> concesión deliberada.
>
> **No comentes**: lo que el nombre ya dice; encabezados de sección; tablas de equivalencia
> didácticas con otras librerías; narración paso a paso de la línea siguiente; código muerto
> comentado — se borra.

### 10bis. Equivalencias en JavaScript plano

La regla de dependencia, la estructura de carpetas, el catálogo de patrones y las reglas de
seguridad aplican **sin cambios** en un proyecto JavaScript. Solo cambia cómo se expresa un
contrato:

| Contrato en TS | Equivalente en JS |
|---|---|
| `abstract class` + métodos `abstract` | clase base ES6 cuyos métodos lanzan `Error('Method not implemented')`; las subclases sobreescriben |
| `interface` de capacidad técnica | duck typing + `@typedef` JSDoc; el adapter se pasa igual, sin `implements` |
| constructor privado | campo/constructor privado `#`, o `static create()` documentado como única vía |
| DTO de request `[error, dto]` | idéntico, sin tipos |
| DTO de response tipado | el servicio devuelve un objeto plano construido por el mapper de respuesta; sin compilador que lo garantice, el test del servicio es obligatorio para probar que el secreto no sale |

### 11. Definición de "terminado"

`npm test` verde, `npm run lint` limpio, comprobación de tipos según el lenguaje (`tsc --noEmit` en
TS; en JS, `tsc --noEmit --checkJs` si el proyecto adopta `jsconfig.json`, o el lint como única
barrera si no), y el flujo probado contra el servidor real levantado (no solo que compile).

### 12. Adopción en un proyecto existente (legacy)

- **No negociable desde el primer feature migrado**: regla de dependencia (§1), SQL parametrizado
  (§8), objetos siempre válidos (§5), un composition root por feature, tests de entidad/DTOs/servicio
  del feature migrado.
- **Admite excepción temporal, documentada en la Parte B con fecha y motivo**: estructura de
  carpetas completa, DTOs de response, presenters, cobertura del código aún no migrado.
- **Convivencia**: el código migrado vive en la estructura nueva desde su primer feature; el legacy
  se queda donde está hasta que le toque migrar. Nunca una carpeta "nueva arquitectura" paralela que
  luego haya que mover. Se migra **feature por feature** (strangler fig), nunca big bang.
- **Un feature se considera migrado cuando**: su lógica de negocio vive en un servicio de `domain/`;
  su acceso a datos, tras un puerto; su composición, en el `routes.ts` del feature; el endpoint está
  verificado end-to-end contra el servidor real; sus tests están en verde.
- La deuda pendiente se anota en la Parte B, con fecha y motivo — nunca se deja implícita.

### 13. Para plantillas y procesos largos

Consulta la skill `node-clean-architecture`: plantilla de código por tipo de artefacto, cómo
arrancar un proyecto nuevo desde cero, cómo migrar un proyecto legacy hacia este patrón
(`references/migration.md`, incluida la convivencia y el orden de features por riesgo).

---

## Parte B — Este proyecto (reemplazar al copiar a otro)

**Qué es**: gestor de turnos (ticket desk) con display en tiempo real vía WebSocket. Stack:
Node.js + TypeScript, Express 5, PostgreSQL 16 (`pg`), `ws`, JWT, bcryptjs.

**Comandos**: `npm run dev` · `npm test` · `npm run test:watch` · `npm run lint` · `npm run build`
· `npm run migrate` / `migrate:down` / `migrate:create` · `npm run seed`. Postgres se levanta con
`docker-compose up -d`.

**Entidades y agregados**: `ticket` (autárquico). Clúster RBAC `user`/`role`/`permission` con
asociación M:N `user_roles` — el agregado `user` no la incluye automáticamente, va en endpoints
aparte (`GET|PUT /api/users/:id/roles`); `UserService` es dueño de la escritura, `RoleService` solo
lee la inversa (`getRoleUsers`).

**Datasources**: Postgres activo. Mongo y external-api implementados como alternativa, no
cableados en ningún composition root.

**Deuda conocida** (estado real, no objetivo — no copiar al reemplazar esta sección):
- `BcryptAdapter` usa `hashSync`/`compareSync` (bloquea el event loop); cambiarlo requiere mover el
  puerto `PasswordHasher` a `Promise`.
- El WebSocket (`WssServer`) no autentica conexiones ni filtra por cliente — hoy solo emite un
  contador público, revisar antes de emitir algo por usuario o por rol.
- Sin CORS: correcto porque el frontend se sirve same-origin desde el mismo Express; revisar si se
  separa.
- Sin revocación de tokens/logout — mitigado parcialmente por la recarga de usuario en cada
  request.
- `requireAdminMiddleware` gatea con el rol simple (`ADMIN`/`USER`); el RBAC granular
  (`role`/`permission`) está implementado pero aún no conectado a ninguna decisión de acceso.
- Los cinco `routes.ts` de features (`tickets`, `users`, `auth`, `roles`, `permissions`)
  construyen cada uno su propio `UserRepositoryImpl` para `authMiddleware` en vez de compartir una
  sola instancia — duplicación conocida, no un composition root único.
- `tsconfig.json` tiene `"jsx": "react-jsx"` heredado de una plantilla; este backend no sirve JSX,
  es una opción sin efecto que debería retirarse.
- `package.json` conserva `"name": "08-user-store"` de un proyecto anterior del curso — no refleja
  este repo (`13-ticket-desk`).
