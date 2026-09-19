-- Up Migration
CREATE TABLE IF NOT EXISTS "tickets" (
  "id"              UUID NOT NULL DEFAULT gen_random_uuid(),
  "number"          INTEGER NOT NULL,
  "create_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "handle_at_desk"  TEXT,
  "handle_at"       TIMESTAMPTZ,
  "done"            BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "PK_tickets_id" PRIMARY KEY ("id")
);

-- Acelera getPending() (WHERE handle_at_desk IS NULL ORDER BY number).
CREATE INDEX "IDX_tickets_number" ON "tickets" ("number")
  WHERE "handle_at_desk" IS NULL;

-- Acelera getWorkingOn() y getCurrentByDesk().
CREATE INDEX "IDX_tickets_handle_at_desk_handle_at" ON "tickets" ("handle_at_desk", "handle_at" DESC)
  WHERE "handle_at_desk" IS NOT NULL;

-- Down Migration
DROP INDEX "IDX_tickets_handle_at_desk_handle_at";
DROP INDEX "IDX_tickets_number";
DROP TABLE "tickets";
