import { infiniteDataMapExtractor } from '@/lib/utils/infiniteDataMapExtractor';
import { Notification } from '@lactalink/types/payload-generated-types';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  createMyNotificationsInfQueryOptions,
  createMyUnseenNotifCountQueryOptions,
} from '../lib/queryOptions';

export function useMyUnseenNotifCount() {
  return useQuery(createMyUnseenNotifCountQueryOptions());
}

export function useMyNotificationsInfQuery() {
  const { data, ...query } = useInfiniteQuery(createMyNotificationsInfQueryOptions());

  const { dataArray, dataMap, ...extracted } = useMemo(() => {
    const unSeenData: Notification[] = [];
    const unReadData: Notification[] = [];
    const extracted = infiniteDataMapExtractor(data, (doc) => {
      if (!doc.seen) unSeenData.push(doc);
      if (!doc.read) unReadData.push(doc);
    });
    return { ...extracted, unSeenData, unReadData };
  }, [data]);

  return { data: dataArray, dataMap, ...extracted, ...query };
}
