-- Up Migration
CREATE TABLE IF NOT EXISTS "addresses" (
  "id"          UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id"     UUID NOT NULL,
  "label"       VARCHAR(50) NOT NULL,
  "street"      VARCHAR(255) NOT NULL,
  "city"        VARCHAR(100) NOT NULL,
  "country"     VARCHAR(100) NOT NULL,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "PK_addresses_id" PRIMARY KEY ("id")
);

CREATE INDEX "IDX_addresses_user_id" ON "addresses" ("user_id");

ALTER TABLE "addresses"
  ADD CONSTRAINT "FK_addresses_user_id"
  FOREIGN KEY ("user_id")
  REFERENCES "users"("id")
  ON DELETE CASCADE
  ON UPDATE NO ACTION;

-- Down Migration
ALTER TABLE "addresses" DROP CONSTRAINT "FK_addresses_user_id";
DROP INDEX "IDX_addresses_user_id";
DROP TABLE "addresses";
