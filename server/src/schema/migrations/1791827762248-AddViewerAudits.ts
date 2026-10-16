import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE OR REPLACE FUNCTION viewer_delete_audit()
  RETURNS TRIGGER
  LANGUAGE PLPGSQL
  AS $$
    BEGIN
      -- assets the viewer could see through this library (never the user's own assets)
      INSERT INTO viewer_asset_audit ("assetId", "userId")
      SELECT a."id", old."userId"
      FROM asset a
      WHERE a."libraryId" = old."libraryId"
        AND a."ownerId" <> old."userId";

      -- persons of the library owner, unless the user still views another library of the same owner
      INSERT INTO viewer_person_audit ("personId", "userId")
      SELECT p."personGroupId", old."userId"
      FROM person p
      JOIN library l ON l."id" = old."libraryId"
      WHERE p."ownerId" = l."ownerId"
        AND p."ownerId" <> old."userId"
        AND NOT EXISTS (
          SELECT 1
          FROM viewer v
          JOIN library l2 ON l2."id" = v."libraryId"
          WHERE v."userId" = old."userId"
            AND l2."ownerId" = l."ownerId"
        );

      RETURN NULL;
    END;
  $$;`.execute(db);
  await sql`COMMENT ON COLUMN "viewer"."albumThumbnailAssetId" IS 'Asset ID to be used as thumbnail';`.execute(db);
  await sql`CREATE OR REPLACE TRIGGER "viewer_delete_audit"
  AFTER DELETE ON "viewer"
  FOR EACH ROW
  EXECUTE FUNCTION viewer_delete_audit();`.execute(db);
  await sql`CREATE TABLE "viewer_asset_audit" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "assetId" uuid NOT NULL,
  "userId" uuid NOT NULL,
  "deletedAt" timestamp with time zone NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT "viewer_asset_audit_pkey" PRIMARY KEY ("id")
);`.execute(db);
  await sql`CREATE INDEX "viewer_asset_audit_assetId_idx" ON "viewer_asset_audit" ("assetId");`.execute(db);
  await sql`CREATE INDEX "viewer_asset_audit_userId_idx" ON "viewer_asset_audit" ("userId");`.execute(db);
  await sql`CREATE INDEX "viewer_asset_audit_deletedAt_idx" ON "viewer_asset_audit" ("deletedAt");`.execute(db);
  await sql`CREATE TABLE "viewer_person_audit" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "personId" uuid NOT NULL,
  "userId" uuid NOT NULL,
  "deletedAt" timestamp with time zone NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT "viewer_person_audit_pkey" PRIMARY KEY ("id")
);`.execute(db);
  await sql`CREATE INDEX "viewer_person_audit_personId_idx" ON "viewer_person_audit" ("personId");`.execute(db);
  await sql`CREATE INDEX "viewer_person_audit_userId_idx" ON "viewer_person_audit" ("userId");`.execute(db);
  await sql`CREATE INDEX "viewer_person_audit_deletedAt_idx" ON "viewer_person_audit" ("deletedAt");`.execute(db);
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('function_viewer_delete_audit', '{"type":"function","name":"viewer_delete_audit","sql":"CREATE OR REPLACE FUNCTION viewer_delete_audit()\\n  RETURNS TRIGGER\\n  LANGUAGE PLPGSQL\\n  AS $$\\n    BEGIN\\n      -- assets the viewer could see through this library (never the user''s own assets)\\n      INSERT INTO viewer_asset_audit (\\"assetId\\", \\"userId\\")\\n      SELECT a.\\"id\\", old.\\"userId\\"\\n      FROM asset a\\n      WHERE a.\\"libraryId\\" = old.\\"libraryId\\"\\n        AND a.\\"ownerId\\" <> old.\\"userId\\";\\n\\n      -- persons of the library owner, unless the user still views another library of the same owner\\n      INSERT INTO viewer_person_audit (\\"personId\\", \\"userId\\")\\n      SELECT p.\\"personGroupId\\", old.\\"userId\\"\\n      FROM person p\\n      JOIN library l ON l.\\"id\\" = old.\\"libraryId\\"\\n      WHERE p.\\"ownerId\\" = l.\\"ownerId\\"\\n        AND p.\\"ownerId\\" <> old.\\"userId\\"\\n        AND NOT EXISTS (\\n          SELECT 1\\n          FROM viewer v\\n          JOIN library l2 ON l2.\\"id\\" = v.\\"libraryId\\"\\n          WHERE v.\\"userId\\" = old.\\"userId\\"\\n            AND l2.\\"ownerId\\" = l.\\"ownerId\\"\\n        );\\n\\n      RETURN NULL;\\n    END;\\n  $$;"}'::jsonb);`.execute(db);
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('trigger_viewer_delete_audit', '{"type":"trigger","name":"viewer_delete_audit","sql":"CREATE OR REPLACE TRIGGER \\"viewer_delete_audit\\"\\n  AFTER DELETE ON \\"viewer\\"\\n  FOR EACH ROW\\n  EXECUTE FUNCTION viewer_delete_audit();"}'::jsonb);`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TRIGGER "viewer_delete_audit" ON "viewer";`.execute(db);
  await sql`DROP FUNCTION viewer_delete_audit;`.execute(db);
  await sql`COMMENT ON COLUMN "viewer"."albumThumbnailAssetId" IS 'undefined';`.execute(db);
  await sql`DROP TABLE "viewer_asset_audit";`.execute(db);
  await sql`DROP TABLE "viewer_person_audit";`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'function_viewer_delete_audit';`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'trigger_viewer_delete_audit';`.execute(db);
}
