import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE OR REPLACE TRIGGER "viewer_updatedAt"
  BEFORE UPDATE ON "viewer"
  FOR EACH ROW
  EXECUTE FUNCTION updated_at();`.execute(db);
  await sql`CREATE UNIQUE INDEX "IDX_viewer_asset_viewerId_assetId" ON "viewer_asset" ("viewerId", "assetId");`.execute(db);
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('trigger_viewer_updatedAt', '{"type":"trigger","name":"viewer_updatedAt","sql":"CREATE OR REPLACE TRIGGER \\"viewer_updatedAt\\"\\n  BEFORE UPDATE ON \\"viewer\\"\\n  FOR EACH ROW\\n  EXECUTE FUNCTION updated_at();"}'::jsonb);`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TRIGGER "viewer_updatedAt" ON "viewer";`.execute(db);
  await sql`DROP INDEX "IDX_viewer_asset_viewerId_assetId";`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'trigger_viewer_updatedAt';`.execute(db);
}
