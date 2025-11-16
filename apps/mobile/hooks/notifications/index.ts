import { extractID } from '@lactalink/utilities/extractors';
import { useCallback, useRef } from 'react';
import { useNotificationMutations } from '../mutations/useNotificationMutations';
import { useFetchNotifications } from './fetcher';

export function useNotification() {
  const { queryKey, data, unReadCount, unSeenData, ...queryMethods } = useFetchNotifications();

  const unSeenDataRef = useRef(unSeenData);

  const {
    markAsReadMutation: { mutateAsync: markAsRead },
    markAsSeenMutation,
  } = useNotificationMutations(queryKey);

  const markAsSeen = useCallback(() => {
    markAsSeenMutation.mutate(extractID(unSeenDataRef.current));
  }, [markAsSeenMutation]);

  return {
    notifications: data,
    markAsRead,
    markAsSeen,
    unReadCount,
    unSeenCount: unSeenData.length,
    queryMethods,
  };
}
