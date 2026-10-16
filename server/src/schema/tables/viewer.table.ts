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
import { UpdateIdColumn, UpdatedAtTrigger } from 'src/decorators.js';
import {
  bump_library_asset_details,
  bump_library_assets,
  bump_library_owner_persons,
  viewer_delete_audit,
} from 'src/schema/functions.js';
import { AssetTable } from 'src/schema/tables/asset.table.js';
import { LibraryTable } from 'src/schema/tables/library.table.js';
import { UserTable } from 'src/schema/tables/user.table.js';

@Table('viewer')
@UpdatedAtTrigger('viewer_updatedAt')
@AfterInsertTrigger({ name: 'viewer_bump_assets_insert', scope: 'row', function: bump_library_assets })
@AfterInsertTrigger({ name: 'bump_library_owner_persons', scope: 'row', function: bump_library_owner_persons })
@AfterInsertTrigger({ name: 'viewer_bump_details_insert', scope: 'row', function: bump_library_asset_details })
//@AfterUpdateTrigger({ name: 'viewer_bump_assets_update', scope: 'row', function: bump_library_assets }) currently not needed?
@AfterDeleteTrigger({ name: 'bump_library_owner_persons_delete', scope: 'row', function: bump_library_owner_persons })
@AfterDeleteTrigger({ name: 'viewer_bump_assets_delete', scope: 'row', function: bump_library_assets })
@AfterDeleteTrigger({ name: 'viewer_delete_audit', scope: 'row', function: viewer_delete_audit })
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
