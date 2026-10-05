<script lang="ts">
  import { goto, invalidate } from '$app/navigation';
  import emptyFoldersUrl from '$lib/assets/empty-folders.svg';
  import AdminCard from '$lib/components/AdminCard.svelte';
  import AdminPageLayout from '$lib/components/layouts/AdminPageLayout.svelte';
  import OnEvents from '$lib/components/OnEvents.svelte';
  import ServerStatisticsCard from '$lib/components/server-statistics/ServerStatisticsCard.svelte';
  import EmptyPlaceholder from '$lib/components/shared-components/EmptyPlaceholder.svelte';
  import TableButton from '$lib/components/TableButton.svelte';
  import LibraryFolderAddModal from '$lib/modals/LibraryFolderAddModal.svelte';
  import UserAvatar from '$lib/components/shared-components/UserAvatar.svelte';
  import { Text } from '@immich/ui';
  import { Route } from '$lib/route';
  import {
    getLibraryActions,
    getLibraryExclusionPatternActions,
    getLibraryFolderActions,
    getLibraryViewerActions,
  } from '$lib/services/library.service';
  import { getBytesWithUnit } from '$lib/utils/byte-units';
  import { Code, CommandPaletteDefaultProvider, Container, Heading, modalManager } from '@immich/ui';
  import {
    mdiCameraIris,
    mdiChartPie,
    mdiFilterMinusOutline,
    mdiGlasses,
    mdiFolderOutline,
    mdiPlayCircle,
  } from '@mdi/js';
  import type { Snippet } from 'svelte';
  import { t } from 'svelte-i18n';
  import type { LayoutData } from './$types';
  import { mdiPlusBoxOutline } from '@mdi/js';
  import { type ActionItem } from '@immich/ui';
  import LibraryViewerAddModal from '$lib/modals/LibraryViewerAddModal.svelte';

  type Props = {
    children?: Snippet;
    data: LayoutData;
  };

  const { children, data }: Props = $props();

  const photosPromise = $derived(data.statisticsPromise.then((stats) => ({ value: stats.photos })));

  const videosPromise = $derived(data.statisticsPromise.then((stats) => ({ value: stats.videos })));

  const usagePromise = $derived(
    data.statisticsPromise.then((stats) => {
      const [value, unit] = getBytesWithUnit(stats.usage);
      return { value, unit };
    }),
  );

  const library = $derived(data.library);

  const viewerUsers = $derived(data.viewerUsers);
  const viewers = $derived(data.viewers);

  const onLibraryUpdate = () => invalidate('app:library');

  const onLibraryDelete = async ({ id }: { id: string }) => {
    if (id === library.id) {
      await goto(Route.libraries());
    }
  };

  const { Edit, Delete, AddFolder, AddExclusionPattern, Scan } = $derived(getLibraryActions($t, library));

  const AddViewer: ActionItem = {
    icon: mdiPlusBoxOutline,
    title: $t('add'),
    onAction: () => modalManager.show(LibraryViewerAddModal, { library, viewers }),
  };
</script>

<OnEvents {onLibraryUpdate} {onLibraryDelete} />

<CommandPaletteDefaultProvider name={$t('library')} actions={[Edit, Delete, AddFolder, AddExclusionPattern, Scan]} />

<AdminPageLayout
  breadcrumbs={[{ title: $t('external_libraries'), href: Route.libraries() }, { title: library.name }]}
  actions={[Scan, Edit, Delete]}
>
  <Container size="giant" center>
    <div class="grid w-full grid-cols-1 gap-4 lg:grid-cols-3">
      <Heading tag="h1" size="large" class="col-span-full my-4">{library.name}</Heading>
      <div class="col-span-full flex flex-col gap-4 lg:flex-row">
        <ServerStatisticsCard icon={mdiCameraIris} title={$t('photos')} valuePromise={photosPromise} />
        <ServerStatisticsCard icon={mdiPlayCircle} title={$t('videos')} valuePromise={videosPromise} />
        <ServerStatisticsCard icon={mdiChartPie} title={$t('usage')} valuePromise={usagePromise} />
      </div>

      <AdminCard icon={mdiFolderOutline} title={$t('folders')} headerAction={AddFolder}>
        {#if library.importPaths.length === 0}
          <EmptyPlaceholder
            src={emptyFoldersUrl}
            text={$t('admin.library_folder_description')}
            fullWidth
            onClick={() => modalManager.show(LibraryFolderAddModal, { library })}
          />
        {:else}
          <table class="w-full">
            <tbody>
              {#each library.importPaths as folder (folder)}
                {@const { Edit, Delete } = getLibraryFolderActions($t, library, folder)}
                <tr class="h-12">
                  <td>
                    <Code>{folder}</Code>
                  </td>
                  <td class="flex justify-end gap-2">
                    <TableButton action={Edit} />
                    <TableButton action={Delete} />
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
      </AdminCard>

      <AdminCard icon={mdiFilterMinusOutline} title={$t('exclusion_pattern')} headerAction={AddExclusionPattern}>
        <table class="w-full">
          <tbody>
            {#each library.exclusionPatterns as exclusionPattern (exclusionPattern)}
              {@const { Edit, Delete } = getLibraryExclusionPatternActions($t, library, exclusionPattern)}
              <tr class="h-12">
                <td>
                  <Code>{exclusionPattern}</Code>
                </td>
                <td class="flex justify-end gap-2">
                  <TableButton action={Edit} />
                  <TableButton action={Delete} />
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </AdminCard>

      <AdminCard icon={mdiGlasses} title={$t('library_viewer')} headerAction={AddViewer}>
        <table class="w-full">
          <tbody>
            {#each viewerUsers as user (user.id)}
              {@const { Edit, Delete } = getLibraryViewerActions($t, library, user.id, viewers)}
              <tr class="h-12">
                <td>
                  <div class="flex gap-2">
                    <UserAvatar {user} size="md" />
                    <div class="grow text-start">
                      <Text fontWeight="medium">{user.name}</Text>
                      <Text size="tiny" color="muted">{user.email}</Text>
                    </div>
                  </div>
                </td>
                <td class="flex justify-end gap-2">
                  <TableButton action={Edit} />
                  <TableButton action={Delete} />
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </AdminCard>
    </div>
    {@render children?.()}
  </Container>
</AdminPageLayout>
