import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "viewer" ADD "updateId" uuid NOT NULL DEFAULT immich_uuid_v7();`.execute(db);
  await sql`CREATE INDEX "viewer_updateId_idx" ON "viewer" ("updateId");`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "viewer" DROP COLUMN "updateId";`.execute(db);
  await sql`DROP INDEX "viewer_updateId_idx";`.execute(db);
}
