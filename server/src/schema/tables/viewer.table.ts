import {
  AfterDeleteTrigger,
  AfterInsertTrigger,
  AfterUpdateTrigger,
  Column,
  CreateDateColumn,
  ForeignKeyColumn,
  type Generated,
  PrimaryGeneratedColumn,
  Table,
  Timestamp,
  UpdateDateColumn,
} from '@immich/sql-tools';
import { nullable } from 'zod';
import { UpdateIdColumn, UpdatedAtTrigger } from 'src/decorators.js';
import { ViewerAlbumAccess } from 'src/enum.js';
import { viewer_album_access_enum } from 'src/schema/enums.js';
import { bump_library_assets } from 'src/schema/functions.js';
import { AssetTable } from 'src/schema/tables/asset.table.js';
import { LibraryTable } from 'src/schema/tables/library.table.js';
import { UserTable } from 'src/schema/tables/user.table.js';

@Table('viewer')
@UpdatedAtTrigger('viewer_updatedAt')
@AfterInsertTrigger({ name: 'viewer_bump_assets_insert', scope: 'row', function: bump_library_assets })
//@AfterUpdateTrigger({ name: 'viewer_bump_assets_update', scope: 'row', function: bump_library_assets }) currently not needed?
@AfterDeleteTrigger({ name: 'viewer_bump_assets_delete', scope: 'row', function: bump_library_assets })
export class ViewerTable {
  @PrimaryGeneratedColumn()
  id!: Generated<string>;

  @ForeignKeyColumn(() => UserTable, { onDelete: 'CASCADE', onUpdate: 'CASCADE', nullable: false })
  userId!: string;

  @ForeignKeyColumn(() => LibraryTable, { onDelete: 'CASCADE', onUpdate: 'CASCADE', nullable: false })
  libraryId!: string;

  @ForeignKeyColumn(() => AssetTable, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    comment: 'Asset ID to be used as thumbnail',
  })
  albumThumbnailAssetId!: string | null;

  @Column({ type: 'boolean', default: false })
  edit!: Generated<boolean>;

  @Column({ type: 'boolean', default: false })
  delete!: Generated<boolean>;

  @CreateDateColumn()
  createdAt!: Generated<Timestamp>;

  @UpdateDateColumn()
  updatedAt!: Generated<Date>;

  @UpdateIdColumn({ index: true })
  updateId!: Generated<string>;
}
