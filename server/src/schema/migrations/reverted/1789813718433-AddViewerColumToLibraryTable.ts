import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "library" ADD "viewerIds" text[] NOT NULL DEFAULT '{}';`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "library" DROP COLUMN "viewerIds";`.execute(db);
}
