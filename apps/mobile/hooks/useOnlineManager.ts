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
    refetchInterval: 1000 * 10, // every 10 seconds
    staleTime: Infinity,
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

  const now = new Date().toISOString();

  const updatedUser = await apiClient.updateByID({
    collection: 'users',
    id: meUser.id,
    data: { onlineAt: now },
  });

  // Update meUser in store and cache
  setMeUser(
    produce(meUser, (draft) => {
      draft.onlineAt = now;
    })
  );

  client.setQueryData(meUserQueryOptions.queryKey, (old) => {
    if (!old) return old;
    return produce(old, (draft) => {
      draft.onlineAt = now;
    });
  });

  client.setQueryData(sessionQueryOptions.queryKey, (old) => {
    if (!old) return old;
    return produce(old, (draft) => {
      if (!draft.user) return;
      draft.user.onlineAt = now;
    });
  });

  return !!updatedUser;
}
