import { Route } from '#lib/route.ts';
import { authenticate } from '#lib/utils/auth.ts';
import { getFormatter } from '#lib/utils/i18n.ts';
import {
  getLibrary,
  getLibraryStatistics,
  getUser,
  getViewersByLibraryId,
  type LibraryResponseDto,
  type UserResponseDto,
  type ViewerResponseDto,
} from '@immich/sdk';
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load = (async ({ params: { id }, url }) => {
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
