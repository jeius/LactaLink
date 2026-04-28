import { getApiClient } from '@/lib/services';
import { getMeUser } from '@/lib/stores/meUserStore';

export async function getMyNotifications(
  { page, limit = 10 }: { page: number; limit?: number },
  init?: RequestInit
) {
  const meUser = getMeUser();
  if (!meUser) {
    throw new Error('User not logged in');
  }

  return getApiClient().find(
    {
      collection: 'notifications',
      where: { recipient: { equals: meUser.id } },
      sort: '-createdAt',
      depth: 2,
      page,
      limit,
    },
    init
  );
}

export async function getMyUnseenNotifCount(init?: RequestInit) {
  const meUser = getMeUser();
  if (!meUser) {
    throw new Error('User not logged in');
  }

  const { totalDocs } = await getApiClient().count(
    {
      collection: 'notifications',
      where: {
        and: [
          { recipient: { equals: meUser.id } },
          {
            or: [{ seen: { exists: false } }, { seen: { equals: false } }],
          },
        ],
      },
    },
    init
  );

  return totalDocs;
}
