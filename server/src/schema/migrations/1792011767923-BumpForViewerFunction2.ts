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

      -- memories first, so the client has the memory before its memory_asset rows
      UPDATE memory SET "updatedAt" = clock_timestamp()
      WHERE "ownerId" = (SELECT "ownerId" FROM library WHERE "id" = new."libraryId");

      UPDATE memory_asset SET "updateId" = immich_uuid_v7()
      WHERE "assetId" IN (SELECT "id" FROM asset WHERE "libraryId" = new."libraryId");

      RETURN NULL;
    END;
  $$;`.execute(db);
  await sql`UPDATE "migration_overrides" SET "value" = '{"type":"function","name":"bump_library_asset_details","sql":"CREATE OR REPLACE FUNCTION bump_library_asset_details()\\n  RETURNS TRIGGER\\n  LANGUAGE PLPGSQL\\n  AS $$\\n    BEGIN\\n      UPDATE asset_exif SET \\"updateId\\" = immich_uuid_v7()\\n      WHERE \\"assetId\\" IN (SELECT \\"id\\" FROM asset WHERE \\"libraryId\\" = new.\\"libraryId\\");\\n\\n      UPDATE asset_metadata SET \\"updateId\\" = immich_uuid_v7()\\n      WHERE \\"assetId\\" IN (SELECT \\"id\\" FROM asset WHERE \\"libraryId\\" = new.\\"libraryId\\");\\n\\n      UPDATE asset_ocr SET \\"updateId\\" = immich_uuid_v7()\\n      WHERE \\"assetId\\" IN (SELECT \\"id\\" FROM asset WHERE \\"libraryId\\" = new.\\"libraryId\\");\\n\\n      UPDATE asset_edit SET \\"updateId\\" = immich_uuid_v7()\\n      WHERE \\"assetId\\" IN (SELECT \\"id\\" FROM asset WHERE \\"libraryId\\" = new.\\"libraryId\\");\\n\\n      -- memories first, so the client has the memory before its memory_asset rows\\n      UPDATE memory SET \\"updatedAt\\" = clock_timestamp()\\n      WHERE \\"ownerId\\" = (SELECT \\"ownerId\\" FROM library WHERE \\"id\\" = new.\\"libraryId\\");\\n\\n      UPDATE memory_asset SET \\"updateId\\" = immich_uuid_v7()\\n      WHERE \\"assetId\\" IN (SELECT \\"id\\" FROM asset WHERE \\"libraryId\\" = new.\\"libraryId\\");\\n\\n      RETURN NULL;\\n    END;\\n  $$;"}'::jsonb WHERE "name" = 'function_bump_library_asset_details';`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`CREATE OR REPLACE FUNCTION public.bump_library_asset_details()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
  $function$
`.execute(db);
  await sql`UPDATE "migration_overrides" SET "value" = '{"sql":"CREATE OR REPLACE FUNCTION bump_library_asset_details()\\n  RETURNS TRIGGER\\n  LANGUAGE PLPGSQL\\n  AS $$\\n    BEGIN\\n      UPDATE asset_exif SET \\"updateId\\" = immich_uuid_v7()\\n      WHERE \\"assetId\\" IN (SELECT \\"id\\" FROM asset WHERE \\"libraryId\\" = new.\\"libraryId\\");\\n\\n      UPDATE asset_metadata SET \\"updateId\\" = immich_uuid_v7()\\n      WHERE \\"assetId\\" IN (SELECT \\"id\\" FROM asset WHERE \\"libraryId\\" = new.\\"libraryId\\");\\n\\n      UPDATE asset_ocr SET \\"updateId\\" = immich_uuid_v7()\\n      WHERE \\"assetId\\" IN (SELECT \\"id\\" FROM asset WHERE \\"libraryId\\" = new.\\"libraryId\\");\\n\\n      UPDATE asset_edit SET \\"updateId\\" = immich_uuid_v7()\\n      WHERE \\"assetId\\" IN (SELECT \\"id\\" FROM asset WHERE \\"libraryId\\" = new.\\"libraryId\\");\\n\\n      UPDATE memory SET \\"updatedAt\\" = clock_timestamp()\\n      WHERE \\"ownerId\\" = (SELECT \\"ownerId\\" FROM library WHERE \\"id\\" = new.\\"libraryId\\");\\n\\n      RETURN NULL;\\n    END;\\n  $$;","name":"bump_library_asset_details","type":"function"}'::jsonb WHERE "name" = 'function_bump_library_asset_details';`.execute(db);
}
