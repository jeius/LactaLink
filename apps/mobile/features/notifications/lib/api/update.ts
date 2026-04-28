import { getApiClient } from '@/lib/services';

export async function markSeen(id: string | string[], init?: RequestInit) {
  const apiClient = getApiClient();
  const ids = Array.isArray(id) ? id : [id];
  const now = new Date().toISOString();

  if (!ids.length) return;

  return apiClient.update(
    {
      collection: 'notifications',
      data: { seenAt: now, seen: true },
      depth: 2,
      where: {
        and: [
          { id: { in: ids } },
          { or: [{ seen: { exists: false } }, { seen: { equals: false } }] },
        ],
      },
    },
    init
  );
}

export async function markRead(id: string | string[], init?: RequestInit) {
  const apiClient = getApiClient();
  const ids = Array.isArray(id) ? id : [id];
  const now = new Date().toISOString();

  if (!ids.length) return;

  return apiClient.update(
    {
      collection: 'notifications',
      data: { readAt: now, read: true },
      depth: 2,
      where: {
        and: [
          { id: { in: ids } },
          { or: [{ read: { exists: false } }, { read: { equals: false } }] },
        ],
      },
    },
    init
  );
}
