import {
  AfterDeleteTrigger,
  AfterInsertTrigger,
  AfterUpdateTrigger,
  Column,
  CreateDateColumn,
  ForeignKeyColumn,
  type Generated,
  Index,
  PrimaryGeneratedColumn,
  Table,
  Timestamp,
  UpdateDateColumn,
} from '@immich/sql-tools';
import { AssetVisibility } from 'src/enum.js';
import { asset_visibility_enum } from 'src/schema/enums.js';
import { bump_from_viewer_assets } from 'src/schema/functions.js';
import { AssetTable } from 'src/schema/tables/asset.table.js';
import { ViewerTable } from 'src/schema/tables/viewer.table.js';

@Table('viewer_asset')
@Index({ name: 'IDX_viewer_asset_viewerId_assetId', columns: ['viewerId', 'assetId'], unique: true })
@AfterInsertTrigger({ name: 'viewer_asset_bump_assets_insert', scope: 'row', function: bump_from_viewer_assets })
@AfterUpdateTrigger({ name: 'viewer_asset_bump_assets_update', scope: 'row', function: bump_from_viewer_assets })
@AfterDeleteTrigger({ name: 'viewer_asset_bump_assets_delete', scope: 'row', function: bump_from_viewer_assets })
export class ViewerAssetTable {
  @PrimaryGeneratedColumn()
  id!: Generated<string>;

  @ForeignKeyColumn(() => ViewerTable, { onDelete: 'CASCADE', onUpdate: 'CASCADE', nullable: false })
  viewerId!: string;

  @ForeignKeyColumn(() => AssetTable, { onDelete: 'CASCADE', onUpdate: 'CASCADE', nullable: false })
  assetId!: string;

  @Column({ type: 'boolean', default: false })
  isFavorite!: Generated<boolean>;

  @Column({ enum: asset_visibility_enum, default: AssetVisibility.Timeline })
  visibility!: Generated<AssetVisibility>;

  @CreateDateColumn()
  createdAt!: Generated<Timestamp>;

  @UpdateDateColumn()
  updatedAt!: Generated<Date>;
}
