<script lang="ts">
  import { handleEditLibraryViewer } from '$lib/services/library.service';
  import { type LibraryResponseDto, type ViewerResponseDto } from '@immich/sdk';
  import { Field, FormModal, Switch, Text } from '@immich/ui';
  import { t } from 'svelte-i18n';

  type Props = {
    library: LibraryResponseDto;
    userId: string;
    viewers: ViewerResponseDto[];
    onClose: () => void;
  };

  const { library, userId, viewers, onClose }: Props = $props();
  const viewer = viewers.find((v) => v.userId === userId);
  let editPermission: boolean = $state(viewer && viewer.edit !== undefined ? viewer.edit : false);
  let deletePermission: boolean = $state(viewer && viewer.delete !== undefined ? viewer.delete : false);

  console.log(editPermission, deletePermission);

  const onSubmit = async () => {
    const success = await handleEditLibraryViewer(library, userId, viewers, {
      edit: editPermission,
      delete: deletePermission,
    });
    if (success) {
      onClose();
    }
  };
</script>

<FormModal title={$t('library_viewer_edit')} {onClose} {onSubmit} size="small">
  <Field label={$t('library_viewer_asset_edit')} class="w-full">
    <Switch bind:checked={editPermission} class="mb-2" />
    <Text size="small" class="mt-2" color="muted">
      {$t('library_viewer_asset_edit_desc')}
    </Text>
  </Field>

  <Field label={$t('library_viewer_asset_delete')} class="w-full">
    <Switch bind:checked={deletePermission} class="mt-4 mb-2" />
  </Field>
</FormModal>
