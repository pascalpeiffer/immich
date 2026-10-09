import { getLibrary, getLibraryStatistics, type LibraryResponseDto, type UserResponseDto, type ViewerResponseDto, getViewersByLibraryId, getUser } from '@immich/sdk';
import { redirect } from '@sveltejs/kit';
import { Route } from '$lib/route';
import { authenticate } from '$lib/utils/auth';
import { getFormatter } from '$lib/utils/i18n';
import type { LayoutLoad } from './$types';

export const load = (async ({ params: { id }, url, depends }) => {
  depends('app:library');
  await authenticate(url, { admin: true });

  let library: LibraryResponseDto;
  let viewers: ViewerResponseDto[];
  let viewerUsers: UserResponseDto[];

  try {
    library = await getLibrary({ id });
  } catch {
    redirect(307, Route.libraries());
  }

  try {
    viewers = await getViewersByLibraryId({ id });
  } catch {
    redirect(307, Route.libraries());
  }

  try {
    viewerUsers = await Promise.all(viewers.map((v) => getUser({ id: v.userId })));
  } catch {
    redirect(307, Route.libraries());
  }

  const statisticsPromise = getLibraryStatistics({ id });
  const $t = await getFormatter();

  return {
    library,
    viewerUsers,
    viewers,
    statisticsPromise,
    meta: {
      title: $t('admin.library_details'),
    },
  };
}) satisfies LayoutLoad;
