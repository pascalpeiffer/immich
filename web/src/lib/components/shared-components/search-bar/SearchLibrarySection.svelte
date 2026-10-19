<script lang="ts">
  import ImageThumbnail from '$lib/components/assets/thumbnail/ImageThumbnail.svelte';
  import { getLibrary, getPeople, getSearchLibraryTitle, getSearchPeopleTitle } from './search-bar-utils';
  import SingleGridRow from '$lib/components/shared-components/SingleGridRow.svelte';
  import SearchBar from '$lib/elements/SearchBar.svelte';
  import { getAssetUrl, getPeopleThumbnailUrl } from '$lib/utils';
  import { getAssetThumbnailPath, type LibraryWithAssetResponseDto } from '@immich/sdk';
  import { Button, Icon, LoadingSpinner, Text } from '@immich/ui';
  import { mdiArrowRight, mdiCheck, mdiClose } from '@mdi/js';
  import { t } from 'svelte-i18n';
  import { searchManager } from '$lib/managers/search-manager.svelte';

  interface Props {
    title: string | undefined;
    parentPromise: Promise<LibraryWithAssetResponseDto[]> | undefined;
  }

  // eslint-disable-next-line no-useless-assignment
  let { title = $bindable(), parentPromise }: Props = $props();

  let selectedLibraries = $derived(searchManager.filter.libraryIds);
  let libraryPromise = parentPromise ?? getLibrary(selectedLibraries);
  let showAllLibraries = $state(false);
  let name = $state('');
  let numberOfLibraries = $state(1);

  function toggleLibrarySelection(id: string, libraries: LibraryWithAssetResponseDto[]) {
    if (selectedLibraries.has(id)) {
      selectedLibraries.delete(id);
    } else {
      selectedLibraries.add(id);
    }

    title = getSearchLibraryTitle(libraries, selectedLibraries);
  }

  const filterLibraries = (list: LibraryWithAssetResponseDto[], name: string) => {
    const nameLower = name.toLowerCase();
    return name ? list.filter((p) => p.name.toLowerCase().includes(nameLower)) : list;
  };
</script>

{#await libraryPromise}
  <div id="spinner" class="-mb-4 flex h-54 items-center justify-center">
    <LoadingSpinner size="large" />
  </div>
{:then libraries}
  {#if libraries && libraries.length > 0}
    {@const libraryList = showAllLibraries
      ? filterLibraries(libraries, name)
      : filterLibraries(libraries, name).slice(0, numberOfLibraries)}

    <div id="people-selection" class="max-h-80 immich-scrollbar overflow-y-auto">
      <Text class="pb-5">{$t('select_library')}</Text>
      <SearchBar bind:name placeholder={$t('search_library')} showLoadingSpinner={false} />

      <SingleGridRow
        class="space-between grid immich-scrollbar grid-auto-fill-20 gap-5 overflow-y-auto pt-5"
        bind:itemCount={numberOfLibraries}
      >
        {#each libraryList as library (library.id)}
          <button
            type="button"
            class="flex flex-col items-center rounded-3xl border-none p-0 transition-all"
            onclick={() => toggleLibrarySelection(library.id, libraries)}
          >
            <div class="relative w-full">
              <ImageThumbnail
                circle
                shadow
                url={library.thumbnailAssetId ? '/api' + getAssetThumbnailPath(library.thumbnailAssetId!) : ''}
                altText={library.name}
                widthStyle="100%"
              />
              {#if selectedLibraries.has(library.id)}
                <div
                  class="absolute top-0 flex size-full items-center justify-center rounded-full bg-primary opacity-75"
                >
                  <Icon icon={mdiCheck} size="32" color="white" />
                </div>
              {/if}
            </div>
            <p class="mt-2 line-clamp-2 text-sm font-medium dark:text-white">{library.name}</p>
          </button>
        {/each}
      </SingleGridRow>

      {#if showAllLibraries || libraries.length > libraryList.length}
        <div class="mt-2 flex justify-center">
          <Button
            size="small"
            color="primary"
            variant="ghost"
            shape="round"
            leadingIcon={showAllLibraries ? mdiClose : mdiArrowRight}
            class="flex place-items-center gap-2"
            onclick={() => (showAllLibraries = !showAllLibraries)}
          >
            {showAllLibraries ? $t('collapse') : $t('show_all_libraries')}
          </Button>
        </div>
      {/if}
    </div>
  {/if}
{/await}
