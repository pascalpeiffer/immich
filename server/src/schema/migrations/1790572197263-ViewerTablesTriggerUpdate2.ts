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
  await sql`UPDATE "migration_overrides" SET "value" = '{"type":"function","name":"bump_from_viewer_assets","sql":"CREATE OR REPLACE FUNCTION bump_from_viewer_assets()\\n  RETURNS TRIGGER\\n  LANGUAGE PLPGSQL\\n  AS $$\\n    DECLARE\\n      ass uuid;\\n    BEGIN\\n      IF TG_OP = ''DELETE'' THEN\\n        ass := old.\\"assetId\\";\\n      ELSE\\n        ass := new.\\"assetId\\";\\n      END IF;\\n\\n      UPDATE asset SET \\"updatedAt\\" = clock_timestamp() WHERE \\"id\\" = ass;\\n      RETURN NULL;\\n    END;\\n  $$;"}'::jsonb WHERE "name" = 'function_bump_from_viewer_assets';`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`CREATE OR REPLACE FUNCTION public.bump_from_viewer_assets()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
  $function$
`.execute(db);
  await sql`UPDATE "migration_overrides" SET "value" = '{"sql":"CREATE OR REPLACE FUNCTION bump_from_viewer_assets()\\n  RETURNS TRIGGER\\n  LANGUAGE PLPGSQL\\n  AS $$\\n    DECLARE\\n      asset uuid;\\n    BEGIN\\n      IF TG_OP = ''DELETE'' THEN\\n        asset := old.\\"assetId\\";\\n      ELSE\\n        asset := new.\\"assetId\\";\\n      END IF;\\n\\n      UPDATE asset SET \\"updatedAt\\" = clock_timestamp() WHERE \\"id\\" = asset;\\n      RETURN NULL;\\n    END;\\n  $$;","name":"bump_from_viewer_assets","type":"function"}'::jsonb WHERE "name" = 'function_bump_from_viewer_assets';`.execute(db);
}
