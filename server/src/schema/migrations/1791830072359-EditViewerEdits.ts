import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "viewer_asset_audit" ALTER COLUMN "id" SET DEFAULT immich_uuid_v7();`.execute(db);
  await sql`ALTER TABLE "viewer_person_audit" ALTER COLUMN "id" SET DEFAULT immich_uuid_v7();`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "viewer_asset_audit" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();`.execute(db);
  await sql`ALTER TABLE "viewer_person_audit" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();`.execute(db);
}
