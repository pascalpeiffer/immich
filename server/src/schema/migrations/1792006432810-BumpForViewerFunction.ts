import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE OR REPLACE FUNCTION bump_library_asset_details()
  RETURNS TRIGGER
  LANGUAGE PLPGSQL
  AS $$
    BEGIN
      UPDATE asset_exif SET "updateId" = immich_uuid_v7()
      WHERE "assetId" IN (SELECT "id" FROM asset WHERE "libraryId" = new."libraryId");

      UPDATE asset_metadata SET "updateId" = immich_uuid_v7()
      WHERE "assetId" IN (SELECT "id" FROM asset WHERE "libraryId" = new."libraryId");

      UPDATE asset_ocr SET "updateId" = immich_uuid_v7()
      WHERE "assetId" IN (SELECT "id" FROM asset WHERE "libraryId" = new."libraryId");

      UPDATE asset_edit SET "updateId" = immich_uuid_v7()
      WHERE "assetId" IN (SELECT "id" FROM asset WHERE "libraryId" = new."libraryId");

      UPDATE memory SET "updatedAt" = clock_timestamp()
      WHERE "ownerId" = (SELECT "ownerId" FROM library WHERE "id" = new."libraryId");

      RETURN NULL;
    END;
  $$;`.execute(db);
  await sql`CREATE OR REPLACE FUNCTION bump_memory_on_asset()
  RETURNS TRIGGER
  LANGUAGE PLPGSQL
  AS $$
    BEGIN
      UPDATE memory SET "updatedAt" = clock_timestamp() WHERE "id" = new."memoriesId";
      RETURN NULL;
    END;
  $$;`.execute(db);
  await sql`CREATE OR REPLACE TRIGGER "memory_asset_bump_memory"
  AFTER INSERT ON "memory_asset"
  FOR EACH ROW
  EXECUTE FUNCTION bump_memory_on_asset();`.execute(db);
  await sql`CREATE OR REPLACE TRIGGER "viewer_bump_details_insert"
  AFTER INSERT ON "viewer"
  FOR EACH ROW
  EXECUTE FUNCTION bump_library_asset_details();`.execute(db);
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('function_bump_library_asset_details', '{"type":"function","name":"bump_library_asset_details","sql":"CREATE OR REPLACE FUNCTION bump_library_asset_details()\\n  RETURNS TRIGGER\\n  LANGUAGE PLPGSQL\\n  AS $$\\n    BEGIN\\n      UPDATE asset_exif SET \\"updateId\\" = immich_uuid_v7()\\n      WHERE \\"assetId\\" IN (SELECT \\"id\\" FROM asset WHERE \\"libraryId\\" = new.\\"libraryId\\");\\n\\n      UPDATE asset_metadata SET \\"updateId\\" = immich_uuid_v7()\\n      WHERE \\"assetId\\" IN (SELECT \\"id\\" FROM asset WHERE \\"libraryId\\" = new.\\"libraryId\\");\\n\\n      UPDATE asset_ocr SET \\"updateId\\" = immich_uuid_v7()\\n      WHERE \\"assetId\\" IN (SELECT \\"id\\" FROM asset WHERE \\"libraryId\\" = new.\\"libraryId\\");\\n\\n      UPDATE asset_edit SET \\"updateId\\" = immich_uuid_v7()\\n      WHERE \\"assetId\\" IN (SELECT \\"id\\" FROM asset WHERE \\"libraryId\\" = new.\\"libraryId\\");\\n\\n      UPDATE memory SET \\"updatedAt\\" = clock_timestamp()\\n      WHERE \\"ownerId\\" = (SELECT \\"ownerId\\" FROM library WHERE \\"id\\" = new.\\"libraryId\\");\\n\\n      RETURN NULL;\\n    END;\\n  $$;"}'::jsonb);`.execute(db);
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('function_bump_memory_on_asset', '{"type":"function","name":"bump_memory_on_asset","sql":"CREATE OR REPLACE FUNCTION bump_memory_on_asset()\\n  RETURNS TRIGGER\\n  LANGUAGE PLPGSQL\\n  AS $$\\n    BEGIN\\n      UPDATE memory SET \\"updatedAt\\" = clock_timestamp() WHERE \\"id\\" = new.\\"memoriesId\\";\\n      RETURN NULL;\\n    END;\\n  $$;"}'::jsonb);`.execute(db);
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('trigger_memory_asset_bump_memory', '{"type":"trigger","name":"memory_asset_bump_memory","sql":"CREATE OR REPLACE TRIGGER \\"memory_asset_bump_memory\\"\\n  AFTER INSERT ON \\"memory_asset\\"\\n  FOR EACH ROW\\n  EXECUTE FUNCTION bump_memory_on_asset();"}'::jsonb);`.execute(db);
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('trigger_viewer_bump_details_insert', '{"type":"trigger","name":"viewer_bump_details_insert","sql":"CREATE OR REPLACE TRIGGER \\"viewer_bump_details_insert\\"\\n  AFTER INSERT ON \\"viewer\\"\\n  FOR EACH ROW\\n  EXECUTE FUNCTION bump_library_asset_details();"}'::jsonb);`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TRIGGER "viewer_bump_details_insert" ON "viewer";`.execute(db);
  await sql`DROP FUNCTION bump_library_asset_details;`.execute(db);
  await sql`DROP TRIGGER "memory_asset_bump_memory" ON "memory_asset";`.execute(db);
  await sql`DROP FUNCTION bump_memory_on_asset;`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'function_bump_library_asset_details';`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'function_bump_memory_on_asset';`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'trigger_memory_asset_bump_memory';`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'trigger_viewer_bump_details_insert';`.execute(db);
}
