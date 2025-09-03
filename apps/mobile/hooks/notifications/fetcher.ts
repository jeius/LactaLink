import { useMeUser } from '@/hooks/auth/useAuth';
import { useInfiniteFetchBySlug } from '@/hooks/collections/useInfiniteFetchBySlug';
import { Notification, User, Where } from '@lactalink/types';
import { createStorageKeyByUser, generatePlaceHolders } from '@lactalink/utilities';
import { useEffect, useMemo } from 'react';
import { MMKV_KEYS } from '../../lib/constants';
import { INFINITE_QUERY_KEY } from '../../lib/constants/queryKeys';
import localStorage from '../../lib/localStorage';
import { depth, ListData } from './utils';

const { LAST_DATA, LAST_FETCH_AT } = MMKV_KEYS.NOTIFICATIONS;

const collection = 'notifications';
const placeholder = generatePlaceHolders(15, { id: 'placeholder' } as Notification);

export function useFetchNotifications() {
  // Get current user to create query filter and storage keys
  const meUser = useMeUser();

  const { fetchOptions, queryKey } = useMemo(() => {
    const where = createQueryFilter(meUser.data);
    const fetchOptions = { where, sort: '-createdAt', depth };
    const queryKey = [...INFINITE_QUERY_KEY, collection, fetchOptions];
    return { fetchOptions, queryKey };
  }, [meUser.data]);

  // Load last fetched data from storage as placeholder data
  const { lastStoredData, lastDataKey, lastFetchAt, lastFetchAtKey } = useMemo(() => {
    const baseKey = `${LAST_DATA}-${queryKey.map((k) => JSON.stringify(k)).join('-')}`;
    const lastDataKey = createStorageKeyByUser(meUser.data, baseKey);
    const lastFetchAtKey = createStorageKeyByUser(meUser.data, LAST_FETCH_AT);

    const lastFetchAt = localStorage.getString(lastFetchAtKey);
    const lastFetchedData = localStorage.getString(lastDataKey);

    let parsedData: ListData | undefined = undefined;
    try {
      if (lastFetchedData) {
        parsedData = JSON.parse(lastFetchedData);
      }
    } catch (err) {
      console.warn('Failed to parse stored notifications data', err);
    }

    return { lastDataKey, lastFetchAtKey, lastFetchAt, lastStoredData: parsedData };
  }, [meUser.data, queryKey]);

  // Infinite query to fetch notifications
  const { data: queryData, ...queryRes } = useInfiniteFetchBySlug(
    true,
    { collection, ...fetchOptions },
    { queryKey, placeholderData: lastStoredData }
  );

  // Derive notifications and unReadCount from query data
  const aggregatedResults = useMemo(() => {
    const newData: Notification[] = [];
    let unReadCount = 0;
    let newDataCount = 0;

    if (queryRes.isLoading) {
      return { data: placeholder, newData, newDataCount, unReadCount };
    }

    const data: Notification[] = [];

    queryData?.pages.forEach((page) => {
      page.docs.forEach((doc) => {
        data.push(doc);

        if (!doc.read) ++unReadCount;

        if (!lastFetchAt) return;

        const dateCreated = new Date(doc.createdAt);
        const dateFetched = new Date(lastFetchAt);

        // Count as new only if it's created after last fetch time
        if (dateCreated > dateFetched) {
          ++newDataCount;
          newData.push(doc);
        }
      });
    });

    return { data, newData, unReadCount, newDataCount };
  }, [queryRes.isLoading, queryData?.pages, lastFetchAt]);

  // Persist last fetched data to storage
  useEffect(() => {
    const currentFetchTimestamp = new Date(queryRes.dataUpdatedAt).toISOString();
    if (lastFetchAt !== currentFetchTimestamp) {
      localStorage.set(lastFetchAtKey, currentFetchTimestamp);
    }

    if (queryData) {
      localStorage.set(lastDataKey, JSON.stringify(queryData));
    }
  }, [lastDataKey, lastFetchAt, lastFetchAtKey, queryData, queryRes.dataUpdatedAt]);

  return { ...aggregatedResults, queryKey, ...queryRes };
}

function createQueryFilter(user: User | null): Where | undefined {
  if (!user) return undefined;
  return {
    recipient: { equals: user.id },
  };
}
