import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE OR REPLACE TRIGGER "bump_library_owner_persons"
  AFTER INSERT ON "viewer"
  FOR EACH ROW
  EXECUTE FUNCTION bump_library_owner_persons();`.execute(db);
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('trigger_bump_library_owner_persons', '{"type":"trigger","name":"bump_library_owner_persons","sql":"CREATE OR REPLACE TRIGGER \\"bump_library_owner_persons\\"\\n  AFTER INSERT ON \\"viewer\\"\\n  FOR EACH ROW\\n  EXECUTE FUNCTION bump_library_owner_persons();"}'::jsonb);`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TRIGGER "bump_library_owner_persons" ON "viewer";`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'trigger_bump_library_owner_persons';`.execute(db);
}
