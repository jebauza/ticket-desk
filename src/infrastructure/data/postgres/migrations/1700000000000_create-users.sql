-- Up Migration
CREATE TABLE IF NOT EXISTS
  "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid (),
    "name" VARCHAR (100) NOT NULL,
    "email" VARCHAR (255) NOT NULL,
    "email_validated" BOOLEAN NOT NULL DEFAULT false,
    "password" VARCHAR (255) NOT NULL,
    "img" VARCHAR (500),
    "role" VARCHAR (20) NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
  );

CREATE UNIQUE INDEX "UQ_users_email" ON "users" (LOWER("email"));

-- Down Migration
DROP INDEX "UQ_users_email";

DROP TABLE "users";