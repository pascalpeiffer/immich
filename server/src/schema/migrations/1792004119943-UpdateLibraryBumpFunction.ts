import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE OR REPLACE FUNCTION bump_library_owner_persons()
  RETURNS TRIGGER
  LANGUAGE PLPGSQL
  AS $$
    BEGIN
      UPDATE person
      SET "updatedAt" = clock_timestamp()
      WHERE "ownerId" = (SELECT "ownerId" FROM library WHERE "id" = new."libraryId");

      UPDATE asset_face
      SET "updatedAt" = clock_timestamp()
      WHERE "assetId" IN (SELECT "id" FROM asset WHERE "libraryId" = new."libraryId");

      RETURN NULL;
    END;
  $$;`.execute(db);
  await sql`UPDATE "migration_overrides" SET "value" = '{"type":"function","name":"bump_library_owner_persons","sql":"CREATE OR REPLACE FUNCTION bump_library_owner_persons()\\n  RETURNS TRIGGER\\n  LANGUAGE PLPGSQL\\n  AS $$\\n    BEGIN\\n      UPDATE person\\n      SET \\"updatedAt\\" = clock_timestamp()\\n      WHERE \\"ownerId\\" = (SELECT \\"ownerId\\" FROM library WHERE \\"id\\" = new.\\"libraryId\\");\\n\\n      UPDATE asset_face\\n      SET \\"updatedAt\\" = clock_timestamp()\\n      WHERE \\"assetId\\" IN (SELECT \\"id\\" FROM asset WHERE \\"libraryId\\" = new.\\"libraryId\\");\\n\\n      RETURN NULL;\\n    END;\\n  $$;"}'::jsonb WHERE "name" = 'function_bump_library_owner_persons';`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`CREATE OR REPLACE FUNCTION public.bump_library_owner_persons()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
    BEGIN
      UPDATE person
      SET "updatedAt" = clock_timestamp()
      WHERE "ownerId" = (SELECT "ownerId" FROM library WHERE "id" = new."libraryId");
      RETURN NULL;
    END;
  $function$
`.execute(db);
  await sql`UPDATE "migration_overrides" SET "value" = '{"sql":"CREATE OR REPLACE FUNCTION bump_library_owner_persons()\\n  RETURNS TRIGGER\\n  LANGUAGE PLPGSQL\\n  AS $$\\n    BEGIN\\n      UPDATE person\\n      SET \\"updatedAt\\" = clock_timestamp()\\n      WHERE \\"ownerId\\" = (SELECT \\"ownerId\\" FROM library WHERE \\"id\\" = new.\\"libraryId\\");\\n      RETURN NULL;\\n    END;\\n  $$;","name":"bump_library_owner_persons","type":"function"}'::jsonb WHERE "name" = 'function_bump_library_owner_persons';`.execute(db);
}
