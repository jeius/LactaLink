import { useFetchNotifications } from './fetcher';
import { useMutateNotifications } from './mutator';

export function useNotification() {
  const { queryKey, data, unReadCount, ...queryMethods } = useFetchNotifications();

  const {
    markAsReadMutation: { mutateAsync: markAsRead },
  } = useMutateNotifications(queryKey);

  return { markAsRead, notifications: data, unReadCount, queryMethods };
}
