import { useMeUser } from '@/hooks/auth/useAuth';
import { useInfiniteFetchBySlug } from '@/hooks/collections/useInfiniteFetchBySlug';
import { Notification, User, Where } from '@lactalink/types';
import { createStorageKeyByUser, generatePlaceHolders } from '@lactalink/utilities';
import { useEffect, useMemo } from 'react';
import { MMKV_KEYS } from '../../lib/constants';
import { INFINITE_QUERY_KEY } from '../../lib/constants/queryKeys';
import localStorage from '../../lib/localStorage';
import { depth, ListData } from './utils';

const { LAST_DATA, LAST_FETCH } = MMKV_KEYS.NOTIFICATIONS;

const collection = 'notifications';
const placeholder = generatePlaceHolders(15, { id: 'placeholder' } as Notification);

export function useFetchNotifications() {
  // Get current user to create query filter and storage keys
  const meUser = useMeUser();
  const where = createQueryFilter(meUser.data);
  const fetchOptions = { where, sort: '-createdAt', depth };

  const queryKey = [...INFINITE_QUERY_KEY, collection, fetchOptions];

  // Load last fetched data from storage as placeholder data
  const lastDataKey = useMemo(() => createStorageKeyByUser(meUser.data, LAST_DATA), [meUser.data]);
  const storedPreviousData = useMemo(() => {
    const lastFetchedData = localStorage.getString(lastDataKey);
    if (!lastFetchedData) return undefined;
    try {
      return JSON.parse(lastFetchedData) as ListData;
    } catch {
      return undefined;
    }
  }, [lastDataKey]);

  // Infinite query to fetch notifications
  const { data: queryData, ...queryRes } = useInfiniteFetchBySlug(
    true,
    { collection, ...fetchOptions },
    { queryKey, placeholderData: storedPreviousData }
  );

  // Derive notifications and unReadCount from query data
  const { data: notifications, unReadCount } = useMemo(() => {
    const isLoading = queryRes.isLoading;
    const data = queryData?.pages.flatMap((page) => page.docs) || [];
    const unReadCount = data.reduce((count, n) => (n.read ? count : count + 1), 0);
    return {
      data: isLoading ? placeholder : data,
      unReadCount: isLoading ? undefined : unReadCount,
    };
  }, [queryRes.isLoading, queryData]);

  // Persist last fetched data to storage
  useEffect(() => {
    if (!meUser.data || !queryData) return;

    localStorage.set(createStorageKeyByUser(meUser.data, LAST_FETCH), new Date().toISOString());
    localStorage.set(lastDataKey, JSON.stringify(queryData));
  }, [lastDataKey, meUser.data, queryData]);

  return { data: notifications, unReadCount, queryKey, ...queryRes };
}

function createQueryFilter(user: User | null): Where | undefined {
  if (!user) return undefined;
  return {
    recipient: { equals: user.id },
  };
}
