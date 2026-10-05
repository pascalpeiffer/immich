import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE TYPE "viewer_album_access_enum" AS ENUM ('none','read','write');`.execute(db);
  //await sql`ALTER TABLE "library" ALTER COLUMN "viewerIds" SET DEFAULT NULL;`.execute(db);
  await sql`ALTER TABLE "viewer" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4();`.execute(db);
  await sql`ALTER TABLE "viewer" ADD "albumAccess" viewer_album_access_enum NOT NULL DEFAULT 'none';`.execute(db);
  await sql`ALTER TABLE "viewer" ADD "createdAt" timestamp with time zone NOT NULL DEFAULT now();`.execute(db);
  await sql`ALTER TABLE "viewer" ADD "updatedAt" timestamp with time zone NOT NULL DEFAULT now();`.execute(db);
  await sql`ALTER TABLE "viewer" ADD CONSTRAINT "viewer_pkey" PRIMARY KEY ("id");`.execute(db);
  await sql`CREATE TABLE "viewer_asset" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "viewerId" uuid NOT NULL,
  "assetId" uuid NOT NULL,
  "isFavorite" boolean NOT NULL DEFAULT false,
  "visibility" asset_visibility_enum NOT NULL DEFAULT 'timeline',
  "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "viewer_asset_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "viewer" ("id") ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "viewer_asset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "asset" ("id") ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "viewer_asset_pkey" PRIMARY KEY ("id")
);`.execute(db);
  await sql`CREATE INDEX "viewer_asset_viewerId_idx" ON "viewer_asset" ("viewerId");`.execute(db);
  await sql`CREATE INDEX "viewer_asset_assetId_idx" ON "viewer_asset" ("assetId");`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TYPE "viewer_album_access_enum";`.execute(db);
  await sql`ALTER TABLE "viewer" DROP COLUMN "id";`.execute(db);
  await sql`ALTER TABLE "viewer" DROP COLUMN "albumAccess";`.execute(db);
  await sql`ALTER TABLE "viewer" DROP COLUMN "createdAt";`.execute(db);
  await sql`ALTER TABLE "viewer" DROP COLUMN "updatedAt";`.execute(db);
  await sql`ALTER TABLE "viewer" DROP CONSTRAINT "viewer_pkey";`.execute(db);
  //await sql`ALTER TABLE "library" ALTER COLUMN "viewerIds" SET DEFAULT '{}'::text[];`.execute(db);
  await sql`DROP TABLE "viewer_asset";`.execute(db);
}
