import { meUserQueryOptions, sessionQueryOptions } from '@/lib/queries/authQueryOptions';
import { getMeUser, setMeUser } from '@/lib/stores/meUserStore';
import { getApiClient } from '@lactalink/api';
import NetInfo from '@react-native-community/netinfo';
import { onlineManager, QueryClient, useQuery } from '@tanstack/react-query';
import { produce } from 'immer';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export function useOnlineManager() {
  const [isOnline, setIsOnline] = useState(true);

  useQuery({
    enabled: isOnline,
    queryKey: ['user-presence'],
    queryFn: updateMyPresence,
    refetchOnReconnect: 'always',
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
    refetchInterval: 1000 * 10, // every 1 minute
    staleTime: 1000 * 5, // every 40 seconds
  });

  useEffect(() => {
    // React Query already supports on reconnect auto refetch in web browser
    if (Platform.OS !== 'web') {
      return NetInfo.addEventListener((state) => {
        const isOnline = !!state.isConnected && !!state.isInternetReachable;
        onlineManager.setOnline(isOnline);
        setIsOnline(isOnline);
      });
    }
    return undefined;
  }, []);
}

async function updateMyPresence({ client }: { client: QueryClient }) {
  const meUser = getMeUser();
  if (!meUser) return false;

  const apiClient = getApiClient();

  const updatedUser = await apiClient.updateByID({
    collection: 'users',
    id: meUser.id,
    data: { onlineAt: new Date().toISOString() },
  });

  // Update meUser in store and cache
  setMeUser(updatedUser);
  client.setQueryData(meUserQueryOptions.queryKey, updatedUser);
  client.setQueryData(sessionQueryOptions.queryKey, (old) => {
    if (!old) return old;
    return produce(old, (draft) => {
      draft.user = updatedUser;
    });
  });

  return !!updatedUser;
}
