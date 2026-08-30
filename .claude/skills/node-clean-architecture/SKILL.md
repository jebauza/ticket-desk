---
name: node-clean-architecture
description: Arquitectura por capas escalable para backends Node.js/TypeScript/JavaScript (domain/infrastructure/presentation, entidades, repositorios abstractos, datasources intercambiables por tecnología). Úsala al diseñar o implementar un backend Node nuevo (o un feature nuevo en uno existente), y también cuando el usuario pida mejorar, refactorizar o migrar la arquitectura de un proyecto backend existente hacia algo más escalable ("mejora la arquitectura", "migra esto a algo más limpio/escalable", "este proyecto tiene una arquitectura poco escalable").
user_invocable: true
---

# node-clean-architecture

Patrón de arquitectura por capas para backends Node.js, validado y refinado de punta a punta
en el proyecto `13-ticket-desk` (`/home/jorge/Cursos/NodeJS/Projects/13-ticket-desk`), que
sirve como **ejemplo real ya migrado** — si necesitas ver el patrón aplicado con archivos
concretos, léelo directamente ahí.

Dos modos de uso:
- **Referencia pasiva**: al escribir código nuevo (proyecto nuevo o feature nuevo en uno
  existente), aplica esta estructura directamente, sin preguntar si se debe usar.
- **Migración activa**: cuando el usuario pida mejorar/migrar la arquitectura de un proyecto
  existente, sigue el proceso de la sección "Migración de un proyecto legacy" al final.

## Regla de dependencia

Tres capas, las flechas de import solo apuntan hacia adentro:

```
presentation/  →  domain/
infrastructure/ →  domain/
domain/         →  (nada fuera de sí mismo)
```

`domain/` nunca importa de `infrastructure/` ni de `presentation/`. Los únicos puntos donde
se cruzan capas hacia infraestructura son los **composition roots** (ver más abajo).

## Estructura de carpetas

```
src/
  domain/
    entities/            <Entity>.entity.ts
    repositories/         <entity>.repository.ts   (abstract class, puerto)
    services/             <entity>.service.ts
    errors/               custom.error.ts
  infrastructure/
    data/
      <tecnología>/                       (postgres, mongo, external-api, redis...)
        <tecnología>.database.ts          (conexión/pool/cliente, singleton)
        <entidad>/
          <entity>.<tecnología>.datasource.ts
          <entity>.<tecnología>.mapper.ts
    repositories/
      <entidad>/
        <entity>.datasource.ts            (abstract class, puerto)
        <entity>.repository.impl.ts       (única implementación, agnóstica de tecnología)
    adapters/              utilidades técnicas de rol único (uuid, http-client, ...)
  presentation/
    http/
      <feature>/
        routes.ts          composition root del feature
        controller.ts
    cli/
      <algo>.command.ts    composition root de un script de comando
```

### Por qué se organiza así (no por accidente — cada carpeta resuelve una pregunta distinta)

- **`data/<tecnología>/<entidad>/`**: la tecnología (Postgres, Mongo, una API externa) es el
  eje porque **una tecnología puede respaldar varias entidades**, y **una entidad puede tener
  varios datasources intercambiables** (hoy Postgres, mañana Mongo, sin tocar el resto). El
  `<tecnología>.database.ts` (conexión/pool) vive en la raíz de esa carpeta porque lo
  comparten todos los datasources de esa tecnología.
- **`infrastructure/repositories/<entidad>/`**: aquí NO se organiza por tecnología —
  `TicketDatasource` es el contrato común que TODAS las tecnologías implementan, y
  `TicketRepositoryImpl` es agnóstico de tecnología. Vive fuera de `data/` a propósito: si
  viviera dentro de `data/postgres/`, cambiar de tecnología significaría desenterrar el
  contrato de la carpeta de un competidor tecnológico.
- **`adapters/`**: solo para utilidades de **un único rol activo a la vez**, sin necesidad de
  swap en runtime (ej. `uuid.adapter.ts`, `http-client.adapter.ts`). Si mañana cambias de
  librería (uuid → nanoid, fetch → axios), **reescribes el mismo archivo**, no creas uno
  nuevo por librería. No llevan `implements` de ningún puerto — son clases con métodos
  estáticos, consumidas pasando la clase misma donde se espera el contrato (funciona por
  tipado estructural en TS; en JS plano no hace falta ni eso).
- **`presentation/http/<feature>/routes.ts` es el composition root del feature**: arma
  `datasource → repository → service → controller` ahí mismo. El entrypoint principal
  (`app.ts`/`main.ts`/`server.ts`) se mantiene mínimo — solo conecta infraestructura
  compartida (pools de conexión) y monta los routers de cada feature — y por eso **no crece**
  a medida que se agregan features nuevos.
- **`presentation/cli/`**: scripts de comando (seeds, migraciones manuales, tareas puntuales)
  son otro "canal de entrada" igual de válido que HTTP — no viven sueltos en `src/`, tienen su
  propio composition root igual que las rutas HTTP.

## La regla de oro para ubicar cualquier contrato

> **Un contrato vive donde vive quien lo recibe por inyección de dependencias — nunca donde
> "suena a que debería ir".**

Esta regla se validó dos veces de forma costosa en la sesión que originó este skill: un
`HttpAdapter` y un `TicketDatasource` terminaron mal puestos en `domain/interfaces/` por
copiar el patrón de otro contrato sin verificar quién lo consumía realmente. Antes de decidir
dónde va un contrato nuevo, pregúntate: **¿qué clase concreta lo recibe por constructor?**
Esa clase (y su capa) determina la ubicación correcta — no la intuición de "esto suena a
dominio" o "esto suena a infraestructura".

Ejemplos ya resueltos:
- `TicketRepository` (abstract class) → `domain/repositories/`, porque `TicketService`
  (un servicio de **dominio**) lo recibe por constructor.
- `TicketDatasource` (abstract class) → `infrastructure/repositories/<entidad>/`, porque
  `TicketRepositoryImpl` (**infraestructura**) es su único consumidor — el dominio nunca lo
  ve.
- `HttpAdapter`/`HttpClientAdapter` → `infrastructure/adapters/`, porque solo lo consume
  `ExternalApiClient` (infraestructura hablándose a sí misma), nunca un servicio de dominio.

## Entidades (`domain/entities/`)

Clase con constructor posicional, propiedades públicas, getters para valores derivados (no
propiedades propias — no aparecen en `JSON.stringify` a menos que se referencien
explícitamente), y un `static fromObject()` que valida los campos requeridos y normaliza los
opcionales (fechas como string → `Date`, `undefined` → `null` explícito para evitar el typado
opcional ambiguo):

```ts
export class TicketEntity {
  constructor(
    public id: string,
    public number: number,
    public createAt: Date,
    public handleAtDesk: string | null,
    public handleAt: Date | null,
    public done: boolean,
  ) {}

  public get isPending(): boolean {
    return this.handleAtDesk === null;
  }

  static fromObject(object: { [key: string]: any }): TicketEntity {
    const { id, number, createAt, handleAtDesk, handleAt, done } = object;
    if (id === undefined) throw new Error('id is required');
    if (number === undefined) throw new Error('number is required');

    return new TicketEntity(
      id,
      number,
      createAt ? new Date(createAt) : new Date(),
      handleAtDesk ?? null,
      handleAt ? new Date(handleAt) : null,
      !!done,
    );
  }
}
```

Cada mapper tecnológico (`ticket.postgres.mapper.ts`, `ticket.mongo.mapper.ts`,
`ticket.api.mapper.ts`) solo renombra las claves de su formato crudo (`snake_case`, `_id`,
JSON con fechas en string) y delega la validación/normalización en `TicketEntity.fromObject`
— así la lógica de parseo no se duplica tres veces.

## Repositorios y datasources: abstract class, no interface

Ambos contratos (`domain/repositories/<entity>.repository.ts` e
`infrastructure/repositories/<entidad>/<entity>.datasource.ts`) se declaran como
**`abstract class`**, no `interface`:

```ts
export abstract class TicketRepository {
  abstract getAll(): Promise<TicketEntity[]>;
  abstract create(id: string): Promise<TicketEntity>;
  // ...
}
```

Las implementaciones usan `extends` (no `implements`). Si la clase derivada define su propio
constructor, debe llamar `super()` explícitamente.

## Repository vs Datasource — la diferencia tangible

- **Datasource**: sabe la tecnología concreta. Un `TicketPostgresDatasource` sabe SQL y
  columnas; un `TicketMongoDatasource` sabe queries de Mongo; un `TicketApiDatasource` sabe
  llamar una API HTTP. Nada más.
- **Repository**: no sabe nada de tecnología. Es dueño de cualquier lógica que no es SQL ni
  regla de negocio de dominio: traducir errores de infraestructura a errores de dominio, y
  cachear.

Ejemplo real de caché en el repositorio (el datasource nunca se entera de que existe):

```ts
export class TicketRepositoryImpl extends TicketRepository {
  private cache: TicketEntity[] | null = null;

  constructor(private readonly datasource: TicketDatasource) {
    super();
  }

  async getAll(): Promise<TicketEntity[]> {
    if (this.cache) return this.cache;
    try {
      this.cache = await this.datasource.getAll();
      return this.cache;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async create(id: string): Promise<TicketEntity> {
    try {
      const ticket = await this.datasource.create(id);
      this.cache = null; // invalidar en cada mutación
      return ticket;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): CustomError {
    if (error instanceof CustomError) return error;
    console.error(error);
    return CustomError.internalServer('Persistence error');
  }
}
```

## Errores de dominio

`CustomError` con constructor privado + factories estáticas, propagado siempre con
`next(error)` hacia un único middleware de error al final de la cadena HTTP:

```ts
export class CustomError extends Error {
  private constructor(public readonly statusCode: number, public readonly message: string) {
    super(message);
  }
  static badRequest(message: string) { return new CustomError(400, message); }
  static notFound(message: string) { return new CustomError(404, message); }
  static internalServer(message: string) { return new CustomError(500, message); }
}
```

Cuidado con el orden de middlewares en Express: el catch-all/SPA y el error handler deben
registrarse **después** de las rutas de la API, o `next(error)` nunca llega al handler.

## Adaptación a JavaScript plano (sin TypeScript)

- `abstract class` con métodos `abstract` → clase ES6 normal cuyos métodos base hacen
  `throw new Error('Method not implemented')`. Las subclases los sobreescriben.
- Sin tipos de retorno ni `interface` — la validación de forma vive solo en
  `Entity.fromObject()` (lanzando `Error` si falta un campo requerido).
- El resto de la estructura de carpetas y la regla de dependencia aplican igual.

## Migración de un proyecto legacy

Cuando el usuario pida mejorar/migrar la arquitectura de un proyecto existente:

1. **Auditar primero, no reescribir a ciegas.** Ubicar dónde vive hoy la lógica de negocio,
   dónde el acceso a datos, y qué tan mezclados están (ej. queries SQL directo en un
   controlador de Express).
2. **Proponer el plan en plan mode**, nunca una migración "big bang" de todo el proyecto de
   una vez. Migrar **feature por feature**.
3. Por cada feature, en este orden:
   a. Extraer la entidad (`domain/entities/`) a partir del shape de datos actual.
   b. Definir el contrato del repositorio (`domain/repositories/`) con los métodos que el
      servicio de dominio realmente necesita — no copiar métodos de otro proyecto sin
      verificar que se usen.
   c. Extraer el datasource concreto (`infrastructure/repositories/<entidad>/` +
      `infrastructure/data/<tecnología>/<entidad>/`) desde el código de acceso a datos
      existente.
   d. Mover la composición (armar datasource→repository→service→controller) al composition
      root de ese feature; mantener el entrypoint principal sin conocer detalles de ningún
      feature individual.
4. **Verificar cada feature end-to-end** (requests reales, no solo que compile) antes de
   migrar el siguiente. Nunca dar por terminada una migración sin correr el código.
5. Si el proyecto es JavaScript plano, aplicar la sección de adaptación a JS de este skill en
   vez de la sintaxis TypeScript.
