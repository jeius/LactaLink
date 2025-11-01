import { useMeUser } from '@/hooks/auth/useAuth';
import { useInfiniteFetchBySlug } from '@/hooks/collections/useInfiniteFetchBySlug';
import { Notification } from '@lactalink/types/payload-generated-types';
import { createStorageKeyByUser, generatePlaceHolders } from '@lactalink/utilities';
import { useEffect, useMemo } from 'react';
import { MMKV_KEYS } from '../../lib/constants';
import { INFINITE_QUERY_KEY } from '../../lib/constants/queryKeys';
import localStorage from '../../lib/localStorage';
import { depth, ListData } from './utils';

const { LAST_DATA } = MMKV_KEYS.NOTIFICATIONS;

const collection = 'notifications';
const placeholder = generatePlaceHolders(15, { id: 'placeholder' } as Notification);

export function useFetchNotifications() {
  // Get current user to create query filter and storage keys
  const meUser = useMeUser();

  const { fetchOptions, queryKey } = useMemo(() => {
    const fetchOptions = { sort: '-createdAt', depth };
    const queryKey = [...INFINITE_QUERY_KEY, collection, fetchOptions];
    return { fetchOptions, queryKey };
  }, [meUser.data]);

  // Load last fetched data from storage as placeholder data
  const { lastStoredData, lastDataKey } = useMemo(() => {
    const baseKey = `${LAST_DATA}-${meUser.data?.id}-${queryKey.map((k) => JSON.stringify(k)).join('-')}`;
    const lastDataKey = createStorageKeyByUser(meUser.data, baseKey);
    const lastFetchedData = localStorage.getString(lastDataKey);

    let parsedData: ListData | undefined = undefined;
    try {
      if (lastFetchedData) {
        parsedData = JSON.parse(lastFetchedData);
      }
    } catch (err) {
      console.warn('Failed to parse stored notifications data', err);
    }

    return { lastDataKey, lastStoredData: parsedData };
  }, [meUser.data, queryKey]);

  // Infinite query to fetch notifications
  const { data: queryData, ...queryRes } = useInfiniteFetchBySlug(
    true,
    { collection, ...fetchOptions },
    { queryKey, placeholderData: lastStoredData }
  );

  // Derive notifications and unReadCount from query data
  const aggregatedResults = useMemo(() => {
    let unReadCount = 0;
    const unSeenData: Notification[] = [];

    if (queryRes.isLoading) {
      return { data: placeholder, unReadCount, unSeenData };
    }

    const data: Notification[] = [];

    queryData?.pages.forEach((page) => {
      page.docs.forEach((doc) => {
        data.push(doc);
        if (!doc.read) ++unReadCount;
        if (!doc.seen) {
          unSeenData.push(doc);
        }
      });
    });

    return { data, unReadCount, unSeenData };
  }, [queryRes.isLoading, queryData?.pages]);

  // Persist last fetched data to storage
  useEffect(() => {
    if (queryData) {
      localStorage.set(lastDataKey, JSON.stringify(queryData));
    }
  }, [lastDataKey, queryData, queryRes.dataUpdatedAt]);

  return { ...aggregatedResults, queryKey, ...queryRes };
}
