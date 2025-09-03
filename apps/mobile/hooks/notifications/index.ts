import { useHomeTabsBadgeStore } from '@/lib/stores/homeTabBadgeStore';
import { extractID } from '@lactalink/utilities';
import { useEffect } from 'react';
import { useFetchNotifications } from './fetcher';
import { useMutateNotifications } from './mutator';

export function useNotification() {
  const { queryKey, data, unReadCount, newData, ...queryMethods } = useFetchNotifications();

  const {
    markAsReadMutation: { mutateAsync: markAsRead },
  } = useMutateNotifications(queryKey);

  useEffect(() => {
    const { pushNewNotificationID } = useHomeTabsBadgeStore.getState();
    pushNewNotificationID(extractID(newData));
  }, [newData]);

  return { markAsRead, notifications: data, unReadCount, newData, queryMethods };
}
