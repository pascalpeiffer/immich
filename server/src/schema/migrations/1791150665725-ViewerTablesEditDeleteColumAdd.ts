import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "viewer" ADD "edit" boolean NOT NULL DEFAULT false;`.execute(db);
  await sql`ALTER TABLE "viewer" ADD "delete" boolean NOT NULL DEFAULT false;`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "viewer" DROP COLUMN "edit";`.execute(db);
  await sql`ALTER TABLE "viewer" DROP COLUMN "delete";`.execute(db);
}
