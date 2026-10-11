import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "viewer" ADD "albumThumbnailAssetId" uuid;`.execute(db);
  await sql`ALTER TABLE "viewer" DROP COLUMN "albumAccess";`.execute(db);
  await sql`CREATE INDEX "viewer_albumThumbnailAssetId_idx" ON "viewer" ("albumThumbnailAssetId");`.execute(db);
  await sql`ALTER TABLE "viewer" ADD CONSTRAINT "viewer_albumThumbnailAssetId_fkey" FOREIGN KEY ("albumThumbnailAssetId") REFERENCES "asset" ("id") ON UPDATE CASCADE ON DELETE SET NULL;`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "viewer" ADD "albumAccess" viewer_album_access_enum NOT NULL DEFAULT 'none'::viewer_album_access_enum;`.execute(db);
  await sql`ALTER TABLE "viewer" DROP COLUMN "albumThumbnailAssetId";`.execute(db);
  await sql`DROP INDEX "viewer_albumThumbnailAssetId_idx";`.execute(db);
  await sql`ALTER TABLE "viewer" DROP CONSTRAINT "viewer_albumThumbnailAssetId_fkey";`.execute(db);
}
