import {
  AfterDeleteTrigger,
  AfterInsertTrigger,
  CreateDateColumn,
  ForeignKeyColumn,
  type Generated,
  Table,
  Timestamp,
  UpdateDateColumn,
} from '@immich/sql-tools';
import { UpdateIdColumn, UpdatedAtTrigger } from 'src/decorators.js';
import { bump_memory_on_asset, memory_asset_delete_audit } from 'src/schema/functions.js';
import { AssetTable } from 'src/schema/tables/asset.table.js';
import { MemoryTable } from 'src/schema/tables/memory.table.js';

@Table('memory_asset')
@UpdatedAtTrigger('memory_asset_updatedAt')
@AfterInsertTrigger({ name: 'memory_asset_bump_memory', scope: 'row', function: bump_memory_on_asset })
@AfterDeleteTrigger({
  scope: 'statement',
  function: memory_asset_delete_audit,
  referencingOldTableAs: 'old',
  when: 'pg_trigger_depth() <= 1',
})
export class MemoryAssetTable {
  @ForeignKeyColumn(() => MemoryTable, { onUpdate: 'CASCADE', onDelete: 'CASCADE', primary: true })
  memoriesId!: string;

  @ForeignKeyColumn(() => AssetTable, { onUpdate: 'CASCADE', onDelete: 'CASCADE', primary: true })
  assetId!: string;

  @CreateDateColumn()
  createdAt!: Generated<Timestamp>;

  @UpdateDateColumn()
  updatedAt!: Generated<Timestamp>;

  @UpdateIdColumn({ index: true })
  updateId!: Generated<string>;
}
