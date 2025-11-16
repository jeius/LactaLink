import { useMeUser } from '@/hooks/auth/useAuth';
import { createInfiniteQueryKey } from '@/lib/utils/createKeys';
import { getApiClient } from '@lactalink/api';
import { Notification } from '@lactalink/types/payload-generated-types';
import { createStorageKeyByUser, generatePlaceHoldersWithID } from '@lactalink/utilities';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { MMKV_KEYS } from '../../lib/constants';
import { useStoredInfiniteData } from '../useStoredData';

const { LAST_DATA } = MMKV_KEYS.NOTIFICATIONS;

const collection = 'notifications';
const placeholder = generatePlaceHoldersWithID(15, {} as Notification);

export function useFetchNotifications() {
  // Get current user to create query filter and storage keys
  const meUser = useMeUser();

  const { fetchOptions, queryKey } = useMemo(() => {
    const fetchOptions = { sort: '-createdAt', depth: 3, limit: 15 };
    const queryKey = createInfiniteQueryKey(collection, fetchOptions);
    return { fetchOptions, queryKey };
  }, []);

  const baseKey = `${LAST_DATA}-${queryKey.map((k) => JSON.stringify(k)).join('-')}`;
  const lastDataKey = createStorageKeyByUser(meUser.data, baseKey);

  const [stored, setStored] = useStoredInfiniteData<Notification>(lastDataKey);

  const { data: queryData, ...queryRes } = useInfiniteQuery({
    queryKey,
    initialPageParam: 1,
    placeholderData: stored,
    queryFn: async ({ pageParam }) => {
      const apiClient = getApiClient();
      const { docs, ...result } = await apiClient.find({
        collection: 'notifications',
        ...fetchOptions,
        page: pageParam,
        pagination: true,
      });
      const map = new Map(docs.map((doc) => [doc.id, doc]));
      return { docs: map, ...result };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
  });

  // Derive notifications and unReadCount from query data
  const aggregatedResults = useMemo(() => {
    let unReadCount = 0;
    const unSeenData: Notification[] = [];

    if (queryRes.isLoading) {
      return { data: placeholder, unReadCount, unSeenData };
    }

    const data: Notification[] = [];

    for (const page of queryData?.pages ?? []) {
      page.docs.forEach((doc) => {
        data.push(doc);
        if (!doc.read) unReadCount += 1;
        if (!doc.seen) unSeenData.push(doc);
      });
    }

    return { data, unReadCount, unSeenData };
  }, [queryData, queryRes.isLoading]);

  useEffect(() => {
    if (queryData) {
      // @ts-expect-error Safe to ignore
      setStored(queryData);
    }
  }, [queryData, setStored]);

  return { ...aggregatedResults, queryKey, ...queryRes };
}
