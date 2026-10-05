<script lang="ts">
  import { handleEditLibraryViewer } from '$lib/services/library.service';
  import { type LibraryResponseDto, type ViewerResponseDto, ViewerAlbumAccess } from '@immich/sdk';
  import { Field, FormModal, Select, Switch, Text } from '@immich/ui';
  import { t } from 'svelte-i18n';

  type Props = {
    library: LibraryResponseDto;
    userId: string;
    viewers: ViewerResponseDto[];
    onClose: () => void;
  };

  const { library, userId, viewers, onClose }: Props = $props();
  const viewer = viewers.find((v) => v.userId === userId);
  let selectedAlbumAccess: ViewerAlbumAccess = $state(
    viewer && viewer.albumAccess !== undefined ? viewer.albumAccess : ViewerAlbumAccess.None,
  );
  let editPermission: boolean = $state(viewer && viewer.edit !== undefined ? viewer.edit : false);
  let deletePermission: boolean = $state(viewer && viewer.delete !== undefined ? viewer.delete : false);
  const albumAccesOptions = Object.values(ViewerAlbumAccess);

  console.log(editPermission, deletePermission);

  const onSubmit = async () => {
    const success = await handleEditLibraryViewer(library, userId, viewers, {
      albumAccess: selectedAlbumAccess,
      edit: editPermission,
      delete: deletePermission,
    });
    if (success) {
      onClose();
    }
  };
</script>

<FormModal title="Edit Viewer" {onClose} {onSubmit} size="small">
  <Text size="small" class="mb-4">Hard: Edit this viewers permissions / config?</Text>

  <Field label="Album access" class="w-full">
    <Select options={albumAccesOptions} bind:value={selectedAlbumAccess} class="mb-2" />
  </Field>

  <Field label="Asset edit" class="w-full">
    <Switch bind:checked={editPermission} class="mb-2" />
  </Field>

  <Field label="Asset delete" class="w-full">
    <Switch bind:checked={deletePermission} class="mb-2" />
  </Field>
</FormModal>
