import { type Insertable, Kysely, NotNull, Updateable } from 'kysely';
import { InjectKysely } from 'nestjs-kysely';
import { DummyValue, GenerateSql } from 'src/decorators.js';
import { AssetVisibility } from 'src/enum.js';
import { DB } from 'src/schema/index.js';
import { ViewerTable } from 'src/schema/tables/viewer.table.js';
import { asUuid } from 'src/utils/database.js';

export class ViewerRepository {
  constructor(@InjectKysely() private db: Kysely<DB>) {}

  @GenerateSql()
  async getAll() {
    return this.db.selectFrom('viewer').selectAll().execute();
  }

  @GenerateSql()
  async getAllViewerAssets() {
    return this.db.selectFrom('viewer_asset').selectAll().execute();
  }

  @GenerateSql({ params: [{ libraryId: DummyValue.UUID }] })
  async getById(id: string) {
    return this.db.selectFrom('viewer').selectAll().where('id', '=', asUuid(id)).executeTakeFirst();
  }

  @GenerateSql({ params: [{ libraryId: DummyValue.UUID }] })
  async getByLibraryId(libraryId: string) {
    return this.db.selectFrom('viewer').selectAll().where('libraryId', '=', asUuid(libraryId)).execute();
  }

  @GenerateSql({ params: [{ libraryId: DummyValue.UUID }] })
  async getByUserId(userId: string) {
    return this.db.selectFrom('viewer').selectAll().where('userId', '=', asUuid(userId)).execute();
  }

  @GenerateSql({ params: [{ libraryId: DummyValue.UUID, userId: DummyValue.UUID }] })
  async getByLibraryAndUserId(libraryId: string, userId: string) {
    return this.db
      .selectFrom('viewer')
      .selectAll()
      .where('libraryId', '=', asUuid(libraryId))
      .where('userId', '=', asUuid(userId))
      .executeTakeFirst();
  }

  @GenerateSql({ params: [{ libraryId: DummyValue.UUID, userId: DummyValue.UUID }] })
  async getFavorite(viewerId: string, assetId: string) {
    return this.db
      .selectFrom('viewer_asset')
      .select('isFavorite')
      .where('viewerId', '=', viewerId)
      .where('assetId', '=', assetId)
      .executeTakeFirst();
  }

  @GenerateSql({ params: [{ libraryId: DummyValue.UUID, userId: DummyValue.UUID }] })
  async getVisibility(viewerId: string, assetId: string) {
    return this.db
      .selectFrom('viewer_asset')
      .select('visibility')
      .where('viewerId', '=', viewerId)
      .where('assetId', '=', assetId)
      .executeTakeFirst();
  }

  @GenerateSql({ params: [{ libraryId: DummyValue.UUID, userId: DummyValue.UUID }] })
  async setFavorite(viewerId: string, assetId: string, isFavorite: boolean) {
    return this.db
      .insertInto('viewer_asset')
      .values({ viewerId, assetId, isFavorite })
      .onConflict((oc) => oc.columns(['viewerId', 'assetId']).doUpdateSet({ isFavorite }))
      .executeTakeFirst();
  }

  @GenerateSql({ params: [{ libraryId: DummyValue.UUID, userId: DummyValue.UUID }] })
  async setVisibility(viewerId: string, assetId: string, visibility: AssetVisibility) {
    return this.db
      .insertInto('viewer_asset')
      .values({ viewerId, assetId, visibility })
      .onConflict((oc) => oc.columns(['viewerId', 'assetId']).doUpdateSet({ visibility }))
      .executeTakeFirst();
  }

  @GenerateSql()
  async create(viewer: Insertable<ViewerTable>) {
    return this.db
      .insertInto('viewer')
      .values(viewer)
      .returningAll()
      .$narrowType<{ user: NotNull }>()
      .executeTakeFirstOrThrow();
  }

  update(id: string, viewer: Updateable<ViewerTable>) {
    return this.db
      .updateTable('viewer')
      .set(viewer)
      .where('viewer.id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  @GenerateSql({ params: [{ libraryId: DummyValue.UUID }] })
  async delete(id: string) {
    await this.db.deleteFrom('viewer').where('id', '=', asUuid(id)).execute();
  }
}
