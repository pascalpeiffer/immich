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
      RETURN NULL;
    END;
  $$;`.execute(db);
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('function_bump_library_owner_persons', '{"type":"function","name":"bump_library_owner_persons","sql":"CREATE OR REPLACE FUNCTION bump_library_owner_persons()\\n  RETURNS TRIGGER\\n  LANGUAGE PLPGSQL\\n  AS $$\\n    BEGIN\\n      UPDATE person\\n      SET \\"updatedAt\\" = clock_timestamp()\\n      WHERE \\"ownerId\\" = (SELECT \\"ownerId\\" FROM library WHERE \\"id\\" = new.\\"libraryId\\");\\n      RETURN NULL;\\n    END;\\n  $$;"}'::jsonb);`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP FUNCTION bump_library_owner_persons;`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'function_bump_library_owner_persons';`.execute(db);
}
