import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE OR REPLACE FUNCTION bump_from_viewer_assets()
  RETURNS TRIGGER
  LANGUAGE PLPGSQL
  AS $$
    DECLARE
      ass uuid;
    BEGIN
      IF TG_OP = 'DELETE' THEN
        ass := old."assetId";
      ELSE
        ass := new."assetId";
      END IF;

      UPDATE asset SET "updatedAt" = clock_timestamp() WHERE "id" = ass;
      RETURN NULL;
    END;
  $$;`.execute(db);
  await sql`CREATE OR REPLACE FUNCTION bump_library_assets()
  RETURNS TRIGGER
  LANGUAGE PLPGSQL
  AS $$
    DECLARE
      lib uuid;
    BEGIN
      IF TG_OP = 'DELETE' THEN
        lib := old."libraryId";
      ELSE
        lib := new."libraryId";
      END IF;

      UPDATE asset SET "updatedAt" = clock_timestamp() WHERE "libraryId" = lib;
      RETURN NULL;
    END;
  $$;`.execute(db);
  await sql`CREATE TYPE "viewer_album_access_enum" AS ENUM ('none','read','write');`.execute(db);
  await sql`CREATE TABLE "viewer" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL,
  "libraryId" uuid NOT NULL,
  "albumAccess" viewer_album_access_enum NOT NULL DEFAULT 'none',
  "edit" boolean NOT NULL DEFAULT false,
  "delete" boolean NOT NULL DEFAULT false,
  "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
  "updateId" uuid NOT NULL DEFAULT immich_uuid_v7(),
  CONSTRAINT "viewer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "viewer_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "library" ("id") ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "viewer_pkey" PRIMARY KEY ("id")
);`.execute(db);
  await sql`CREATE INDEX "viewer_userId_idx" ON "viewer" ("userId");`.execute(db);
  await sql`CREATE INDEX "viewer_libraryId_idx" ON "viewer" ("libraryId");`.execute(db);
  await sql`CREATE INDEX "viewer_updateId_idx" ON "viewer" ("updateId");`.execute(db);
  await sql`CREATE OR REPLACE TRIGGER "viewer_bump_assets_delete"
  AFTER DELETE ON "viewer"
  FOR EACH ROW
  EXECUTE FUNCTION bump_library_assets();`.execute(db);
  await sql`CREATE OR REPLACE TRIGGER "viewer_bump_assets_insert"
  AFTER INSERT ON "viewer"
  FOR EACH ROW
  EXECUTE FUNCTION bump_library_assets();`.execute(db);
  await sql`CREATE OR REPLACE TRIGGER "viewer_updatedAt"
  BEFORE UPDATE ON "viewer"
  FOR EACH ROW
  EXECUTE FUNCTION updated_at();`.execute(db);
  await sql`CREATE TABLE "viewer_asset" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "viewerId" uuid NOT NULL,
  "assetId" uuid NOT NULL,
  "isFavorite" boolean NOT NULL DEFAULT false,
  "visibility" asset_visibility_enum NOT NULL DEFAULT 'timeline',
  "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "viewer_asset_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "viewer" ("id") ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "viewer_asset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "asset" ("id") ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "viewer_asset_pkey" PRIMARY KEY ("id")
);`.execute(db);
  await sql`CREATE UNIQUE INDEX "IDX_viewer_asset_viewerId_assetId" ON "viewer_asset" ("viewerId", "assetId");`.execute(db);
  await sql`CREATE INDEX "viewer_asset_viewerId_idx" ON "viewer_asset" ("viewerId");`.execute(db);
  await sql`CREATE INDEX "viewer_asset_assetId_idx" ON "viewer_asset" ("assetId");`.execute(db);
  await sql`CREATE OR REPLACE TRIGGER "viewer_asset_bump_assets_delete"
  AFTER DELETE ON "viewer_asset"
  FOR EACH ROW
  EXECUTE FUNCTION bump_from_viewer_assets();`.execute(db);
  await sql`CREATE OR REPLACE TRIGGER "viewer_asset_bump_assets_update"
  AFTER UPDATE ON "viewer_asset"
  FOR EACH ROW
  EXECUTE FUNCTION bump_from_viewer_assets();`.execute(db);
  await sql`CREATE OR REPLACE TRIGGER "viewer_asset_bump_assets_insert"
  AFTER INSERT ON "viewer_asset"
  FOR EACH ROW
  EXECUTE FUNCTION bump_from_viewer_assets();`.execute(db);
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('function_bump_from_viewer_assets', '{"type":"function","name":"bump_from_viewer_assets","sql":"CREATE OR REPLACE FUNCTION bump_from_viewer_assets()\\n  RETURNS TRIGGER\\n  LANGUAGE PLPGSQL\\n  AS $$\\n    DECLARE\\n      ass uuid;\\n    BEGIN\\n      IF TG_OP = ''DELETE'' THEN\\n        ass := old.\\"assetId\\";\\n      ELSE\\n        ass := new.\\"assetId\\";\\n      END IF;\\n\\n      UPDATE asset SET \\"updatedAt\\" = clock_timestamp() WHERE \\"id\\" = ass;\\n      RETURN NULL;\\n    END;\\n  $$;"}'::jsonb);`.execute(db);
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('function_bump_library_assets', '{"type":"function","name":"bump_library_assets","sql":"CREATE OR REPLACE FUNCTION bump_library_assets()\\n  RETURNS TRIGGER\\n  LANGUAGE PLPGSQL\\n  AS $$\\n    DECLARE\\n      lib uuid;\\n    BEGIN\\n      IF TG_OP = ''DELETE'' THEN\\n        lib := old.\\"libraryId\\";\\n      ELSE\\n        lib := new.\\"libraryId\\";\\n      END IF;\\n\\n      UPDATE asset SET \\"updatedAt\\" = clock_timestamp() WHERE \\"libraryId\\" = lib;\\n      RETURN NULL;\\n    END;\\n  $$;"}'::jsonb);`.execute(db);
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('trigger_viewer_bump_assets_delete', '{"type":"trigger","name":"viewer_bump_assets_delete","sql":"CREATE OR REPLACE TRIGGER \\"viewer_bump_assets_delete\\"\\n  AFTER DELETE ON \\"viewer\\"\\n  FOR EACH ROW\\n  EXECUTE FUNCTION bump_library_assets();"}'::jsonb);`.execute(db);
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('trigger_viewer_bump_assets_insert', '{"type":"trigger","name":"viewer_bump_assets_insert","sql":"CREATE OR REPLACE TRIGGER \\"viewer_bump_assets_insert\\"\\n  AFTER INSERT ON \\"viewer\\"\\n  FOR EACH ROW\\n  EXECUTE FUNCTION bump_library_assets();"}'::jsonb);`.execute(db);
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('trigger_viewer_updatedAt', '{"type":"trigger","name":"viewer_updatedAt","sql":"CREATE OR REPLACE TRIGGER \\"viewer_updatedAt\\"\\n  BEFORE UPDATE ON \\"viewer\\"\\n  FOR EACH ROW\\n  EXECUTE FUNCTION updated_at();"}'::jsonb);`.execute(db);
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('trigger_viewer_asset_bump_assets_delete', '{"type":"trigger","name":"viewer_asset_bump_assets_delete","sql":"CREATE OR REPLACE TRIGGER \\"viewer_asset_bump_assets_delete\\"\\n  AFTER DELETE ON \\"viewer_asset\\"\\n  FOR EACH ROW\\n  EXECUTE FUNCTION bump_from_viewer_assets();"}'::jsonb);`.execute(db);
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('trigger_viewer_asset_bump_assets_update', '{"type":"trigger","name":"viewer_asset_bump_assets_update","sql":"CREATE OR REPLACE TRIGGER \\"viewer_asset_bump_assets_update\\"\\n  AFTER UPDATE ON \\"viewer_asset\\"\\n  FOR EACH ROW\\n  EXECUTE FUNCTION bump_from_viewer_assets();"}'::jsonb);`.execute(db);
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('trigger_viewer_asset_bump_assets_insert', '{"type":"trigger","name":"viewer_asset_bump_assets_insert","sql":"CREATE OR REPLACE TRIGGER \\"viewer_asset_bump_assets_insert\\"\\n  AFTER INSERT ON \\"viewer_asset\\"\\n  FOR EACH ROW\\n  EXECUTE FUNCTION bump_from_viewer_assets();"}'::jsonb);`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TRIGGER "viewer_asset_bump_assets_delete" ON "viewer_asset";`.execute(db);
  await sql`DROP TRIGGER "viewer_asset_bump_assets_update" ON "viewer_asset";`.execute(db);
  await sql`DROP TRIGGER "viewer_asset_bump_assets_insert" ON "viewer_asset";`.execute(db);
  await sql`DROP FUNCTION bump_from_viewer_assets;`.execute(db);
  await sql`DROP TRIGGER "viewer_bump_assets_delete" ON "viewer";`.execute(db);
  await sql`DROP TRIGGER "viewer_bump_assets_insert" ON "viewer";`.execute(db);
  await sql`DROP FUNCTION bump_library_assets;`.execute(db);
  await sql`DROP TABLE "viewer_asset";`.execute(db);
  await sql`DROP TABLE "viewer";`.execute(db);
  await sql`DROP TYPE "viewer_album_access_enum";`.execute(db);
  await sql`DROP TRIGGER "viewer_updatedAt" ON "viewer";`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'function_bump_from_viewer_assets';`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'function_bump_library_assets';`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'trigger_viewer_bump_assets_delete';`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'trigger_viewer_bump_assets_insert';`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'trigger_viewer_updatedAt';`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'trigger_viewer_asset_bump_assets_delete';`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'trigger_viewer_asset_bump_assets_update';`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'trigger_viewer_asset_bump_assets_insert';`.execute(db);
}
