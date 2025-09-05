import { extractID } from '@lactalink/utilities';
import { useFetchNotifications } from './fetcher';
import { useMutateNotifications } from './mutator';

export function useNotification() {
  const { queryKey, data, unReadCount, unSeenData, ...queryMethods } = useFetchNotifications();

  const {
    markAsReadMutation: { mutateAsync: markAsRead },
    markAsSeenMutation,
  } = useMutateNotifications(queryKey);

  function markAsSeen() {
    markAsSeenMutation.mutateAsync(extractID(unSeenData));
  }

  return {
    notifications: data,
    markAsRead,
    markAsSeen,
    unReadCount,
    unSeenCount: unSeenData.length,
    queryMethods,
  };
}
