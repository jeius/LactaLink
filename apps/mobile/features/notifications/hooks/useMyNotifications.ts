import { useCallback } from 'react';
import { useMarkNotifAsReadMutation, useMarkNotifAsSeenMutation } from './mutations';
import { useMyNotificationsInfQuery, useMyUnseenNotifCount } from './queries';

export function useMyNotifications() {
  const {
    data: notifications,
    unSeenData,
    unReadData,
    ...notifQuery
  } = useMyNotificationsInfQuery();
  const { data: unseenCount, ...countQuery } = useMyUnseenNotifCount();

  const markSeenMutation = useMarkNotifAsSeenMutation();
  const markReadMutation = useMarkNotifAsReadMutation();

  const refetch = useCallback(() => {
    notifQuery.refetch();
    countQuery.refetch();
  }, [notifQuery, countQuery]);

  return {
    notifications,
    unSeenNotifications: unSeenData,
    unReadNotifications: unReadData,
    unseenCount,
    isLoading: notifQuery.isLoading || countQuery.isLoading,
    isFetching: notifQuery.isFetching || countQuery.isFetching,
    isRefetching: notifQuery.isRefetching || countQuery.isRefetching,
    refetch,
    notifQuery,
    countQuery,
    markReadMutation,
    markSeenMutation,
  };
}
