import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE OR REPLACE FUNCTION bump_from_viewer_assets()
  RETURNS TRIGGER
  LANGUAGE PLPGSQL
  AS $$
    DECLARE
      asset uuid;
    BEGIN
      IF TG_OP = 'DELETE' THEN
        asset := old."assetId";
      ELSE
        asset := new."assetId";
      END IF;

      UPDATE asset SET "updatedAt" = clock_timestamp() WHERE "id" = asset;
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
  await sql`CREATE OR REPLACE TRIGGER "viewer_bump_assets_delete"
  AFTER DELETE ON "viewer"
  FOR EACH ROW
  EXECUTE FUNCTION bump_library_assets();`.execute(db);
  await sql`CREATE OR REPLACE TRIGGER "viewer_bump_assets_insert"
  AFTER INSERT ON "viewer"
  FOR EACH ROW
  EXECUTE FUNCTION bump_library_assets();`.execute(db);
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
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('function_bump_from_viewer_assets', '{"type":"function","name":"bump_from_viewer_assets","sql":"CREATE OR REPLACE FUNCTION bump_from_viewer_assets()\\n  RETURNS TRIGGER\\n  LANGUAGE PLPGSQL\\n  AS $$\\n    DECLARE\\n      asset uuid;\\n    BEGIN\\n      IF TG_OP = ''DELETE'' THEN\\n        asset := old.\\"assetId\\";\\n      ELSE\\n        asset := new.\\"assetId\\";\\n      END IF;\\n\\n      UPDATE asset SET \\"updatedAt\\" = clock_timestamp() WHERE \\"id\\" = asset;\\n      RETURN NULL;\\n    END;\\n  $$;"}'::jsonb);`.execute(db);
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('function_bump_library_assets', '{"type":"function","name":"bump_library_assets","sql":"CREATE OR REPLACE FUNCTION bump_library_assets()\\n  RETURNS TRIGGER\\n  LANGUAGE PLPGSQL\\n  AS $$\\n    DECLARE\\n      lib uuid;\\n    BEGIN\\n      IF TG_OP = ''DELETE'' THEN\\n        lib := old.\\"libraryId\\";\\n      ELSE\\n        lib := new.\\"libraryId\\";\\n      END IF;\\n\\n      UPDATE asset SET \\"updatedAt\\" = clock_timestamp() WHERE \\"libraryId\\" = lib;\\n      RETURN NULL;\\n    END;\\n  $$;"}'::jsonb);`.execute(db);
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('trigger_viewer_bump_assets_delete', '{"type":"trigger","name":"viewer_bump_assets_delete","sql":"CREATE OR REPLACE TRIGGER \\"viewer_bump_assets_delete\\"\\n  AFTER DELETE ON \\"viewer\\"\\n  FOR EACH ROW\\n  EXECUTE FUNCTION bump_library_assets();"}'::jsonb);`.execute(db);
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('trigger_viewer_bump_assets_insert', '{"type":"trigger","name":"viewer_bump_assets_insert","sql":"CREATE OR REPLACE TRIGGER \\"viewer_bump_assets_insert\\"\\n  AFTER INSERT ON \\"viewer\\"\\n  FOR EACH ROW\\n  EXECUTE FUNCTION bump_library_assets();"}'::jsonb);`.execute(db);
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
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'function_bump_from_viewer_assets';`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'function_bump_library_assets';`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'trigger_viewer_bump_assets_delete';`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'trigger_viewer_bump_assets_insert';`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'trigger_viewer_asset_bump_assets_delete';`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'trigger_viewer_asset_bump_assets_update';`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'trigger_viewer_asset_bump_assets_insert';`.execute(db);
}
