-- Up Migration
CREATE TABLE IF NOT EXISTS "roles" (
  "id"          UUID NOT NULL DEFAULT gen_random_uuid(),
  "name"        VARCHAR(50) NOT NULL,
  "description" VARCHAR(255),
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "PK_roles_id" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UQ_roles_name" ON "roles" (LOWER("name"));

CREATE TABLE IF NOT EXISTS "permissions" (
  "id"          UUID NOT NULL DEFAULT gen_random_uuid(),
  "name"        VARCHAR(100) NOT NULL,
  "description" VARCHAR(255),
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "PK_permissions_id" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UQ_permissions_name" ON "permissions" (LOWER("name"));

-- Tablas de asociación pura: sin id propio, PK compuesta (evita duplicados por
-- construcción, no por lógica de aplicación). No pertenecen ni a "users" ni a
-- "roles" — son la relación en sí.
CREATE TABLE IF NOT EXISTS "user_roles" (
  "user_id"  UUID NOT NULL,
  "role_id"  UUID NOT NULL,
  CONSTRAINT "PK_user_roles_user_id_role_id" PRIMARY KEY ("user_id", "role_id")
);
CREATE INDEX "IDX_user_roles_role_id" ON "user_roles" ("role_id");

ALTER TABLE "user_roles"
  ADD CONSTRAINT "FK_user_roles_user_id"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "user_roles"
  ADD CONSTRAINT "FK_user_roles_role_id"
  FOREIGN KEY ("role_id") REFERENCES "roles"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;

CREATE TABLE IF NOT EXISTS "role_permissions" (
  "role_id"       UUID NOT NULL,
  "permission_id" UUID NOT NULL,
  CONSTRAINT "PK_role_permissions_role_id_permission_id" PRIMARY KEY ("role_id", "permission_id")
);
CREATE INDEX "IDX_role_permissions_permission_id" ON "role_permissions" ("permission_id");

ALTER TABLE "role_permissions"
  ADD CONSTRAINT "FK_role_permissions_role_id"
  FOREIGN KEY ("role_id") REFERENCES "roles"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "role_permissions"
  ADD CONSTRAINT "FK_role_permissions_permission_id"
  FOREIGN KEY ("permission_id") REFERENCES "permissions"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;

-- Down Migration
ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_permission_id";
ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_role_id";
DROP INDEX "IDX_role_permissions_permission_id";
DROP TABLE "role_permissions";

ALTER TABLE "user_roles" DROP CONSTRAINT "FK_user_roles_role_id";
ALTER TABLE "user_roles" DROP CONSTRAINT "FK_user_roles_user_id";
DROP INDEX "IDX_user_roles_role_id";
DROP TABLE "user_roles";

DROP INDEX "UQ_permissions_name";
DROP TABLE "permissions";

DROP INDEX "UQ_roles_name";
DROP TABLE "roles";
