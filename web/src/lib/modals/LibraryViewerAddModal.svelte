<script lang="ts">
  import { handleAddLibraryViewer } from '$lib/services/library.service';
  import UserAvatar from '$lib/components/shared-components/UserAvatar.svelte';
  import { authManager } from '$lib/managers/auth-manager.svelte';
  import { searchUsers, type UserResponseDto, type LibraryResponseDto, type ViewerResponseDto } from '@immich/sdk';
  import { Button, ListButton, LoadingSpinner, Modal, ModalBody, ModalFooter, Text } from '@immich/ui';
  import { t } from 'svelte-i18n';

  type Props = {
    library: LibraryResponseDto;
    viewers: ViewerResponseDto[];
    onClose: () => void;
  };

  const { library, viewers, onClose }: Props = $props();

  let availableUsers: UserResponseDto[] = $state([]);
  let selectedUsers: UserResponseDto[] = $state([]);

  const loadUsers = async () => {
    let users = await searchUsers();

    // remove current user
    users = users.filter(({ id }) => id !== authManager.user.id);

    //const viewersIds = library.viewerIds;
    const viewersIds = new Set([viewers.map((v) => v.userId)]);
    availableUsers = users.filter((user) => !viewersIds.has([user.id]));
  };

  const selectUser = (user: UserResponseDto) => {
    selectedUsers = selectedUsers.includes(user)
      ? selectedUsers.filter((selectedUser) => selectedUser.id !== user.id)
      : [...selectedUsers, user];
  };

  const handleSubmit = async () => {
    const success = await handleAddLibraryViewer(library, selectedUsers, viewers);
    if (success) {
      onClose();
    }
  };
</script>

<Modal title={$t('add_viewer')} {onClose} size="small">
  <ModalBody>
    {#await loadUsers()}
      <div class="flex w-full place-content-center place-items-center">
        <LoadingSpinner />
      </div>
    {:then _}
      {#if availableUsers.length > 0}
        <div class="flex max-h-75 immich-scrollbar flex-col gap-2 overflow-y-auto">
          {#each availableUsers as user (user.id)}
            <ListButton onclick={() => selectUser(user)} selected={selectedUsers.includes(user)}>
              <UserAvatar {user} size="md" />
              <div class="grow text-start">
                <Text fontWeight="medium">{user.name}</Text>
                <Text size="tiny" color="muted">{user.email}</Text>
              </div>
            </ListButton>
          {/each}

          <ModalFooter>
            {#if selectedUsers.length > 0}
              <Button shape="round" fullWidth onclick={handleSubmit}>{$t('add')}</Button>
            {/if}
          </ModalFooter>
        </div>
      {:else}
        <p class="py-5 text-sm">{$t('library_viewer_no_users')}</p>
      {/if}
    {/await}
  </ModalBody>
</Modal>
