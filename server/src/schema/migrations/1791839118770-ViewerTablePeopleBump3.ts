import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE OR REPLACE TRIGGER "bump_library_owner_persons_delete"
  AFTER DELETE ON "viewer"
  FOR EACH ROW
  EXECUTE FUNCTION bump_library_owner_persons();`.execute(db);
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('trigger_bump_library_owner_persons_delete', '{"type":"trigger","name":"bump_library_owner_persons_delete","sql":"CREATE OR REPLACE TRIGGER \\"bump_library_owner_persons_delete\\"\\n  AFTER DELETE ON \\"viewer\\"\\n  FOR EACH ROW\\n  EXECUTE FUNCTION bump_library_owner_persons();"}'::jsonb);`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TRIGGER "bump_library_owner_persons_delete" ON "viewer";`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'trigger_bump_library_owner_persons_delete';`.execute(db);
}
