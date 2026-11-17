<script lang="ts">
  import emptyFoldersUrl from '#lib/assets/empty-folders.svg';
  import AdminCard from '#lib/components/AdminCard.svelte';
  import TableButton from '#lib/components/TableButton.svelte';
  import AdminPageLayout from '#lib/components/layouts/AdminPageLayout.svelte';
  import ServerStatisticsCard from '#lib/components/server-statistics/ServerStatisticsCard.svelte';
  import EmptyPlaceholder from '#lib/components/shared-components/EmptyPlaceholder.svelte';
  import UserAvatar from '#lib/components/shared-components/UserAvatar.svelte';
  import LibraryFolderAddModal from '#lib/modals/LibraryFolderAddModal.svelte';
  import LibraryViewerAddModal from '#lib/modals/LibraryViewerAddModal.svelte';
  import { createPreloadedQuery } from '#lib/queries/client.ts';
  import { getLibraryQuery, getLibraryStatisticsQuery } from '#lib/queries/library.query.ts';
  import { Route } from '#lib/route.ts';
  import {
    getLibraryActions,
    getLibraryExclusionPatternActions,
    getLibraryFolderActions,
    getLibraryViewerActions,
  } from '#lib/services/library.service.ts';
  import { getBytesWithUnit } from '#lib/utils/byte-units.ts';
  import {
    Code,
    CommandPaletteDefaultProvider,
    Container,
    Heading,
    Text,
    modalManager,
    type ActionItem,
  } from '@immich/ui';
  import {
    mdiCameraIris,
    mdiChartPie,
    mdiFilterMinusOutline,
    mdiFolderOutline,
    mdiGlasses,
    mdiPlayCircle,
    mdiPlusBoxOutline,
  } from '@mdi/js';
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from 'svelte-i18n';
  import type { LayoutProps } from './$types';

  const { children, params, data }: LayoutProps = $props();

  const queries = {
    library: createPreloadedQuery(() => getLibraryQuery(params.id)),
    statistics: createQuery(() => getLibraryStatisticsQuery(params.id)),
  };

  const library = $derived(queries.library.data);
  const stats = $derived(queries.statistics.data);

  const viewerUsers = $derived(data.viewerUsers);
  const viewers = $derived(data.viewers);

  const [usage, usageUnit] = $derived(stats ? getBytesWithUnit(stats.usage) : [undefined, undefined]);

  const { Edit, Delete, AddFolder, AddExclusionPattern, Scan } = $derived(getLibraryActions($t, library));

  const AddViewer: ActionItem = {
    icon: mdiPlusBoxOutline,
    title: $t('add'),
    onAction: () => modalManager.show(LibraryViewerAddModal, { library, viewers }),
  };
</script>

<CommandPaletteDefaultProvider name={$t('library')} actions={[Edit, Delete, AddFolder, AddExclusionPattern, Scan]} />

<AdminPageLayout
  breadcrumbs={[{ title: $t('external_libraries'), href: Route.libraries() }, { title: library.name }]}
  actions={[Scan, Edit, Delete]}
>
  <Container size="giant" center>
    <div class="grid w-full grid-cols-1 gap-4 lg:grid-cols-3">
      <Heading tag="h1" size="large" class="col-span-full my-4">{library.name}</Heading>
      <div class="col-span-full flex flex-col gap-4 lg:flex-row">
        <ServerStatisticsCard icon={mdiCameraIris} title={$t('photos')} value={stats?.photos} />
        <ServerStatisticsCard icon={mdiPlayCircle} title={$t('videos')} value={stats?.videos} />
        <ServerStatisticsCard icon={mdiChartPie} title={$t('usage')} value={usage} unit={usageUnit} />
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
                {const { Edit, Delete } = $derived(getLibraryFolderActions($t, library, folder))}
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
              {const { Edit, Delete } = $derived(getLibraryExclusionPatternActions($t, library, exclusionPattern))}
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
              {const { Edit, Delete } = getLibraryViewerActions($t, library, user.id, viewers)}
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
