import { MMKV_KEYS } from '@/lib/constants';
import localStorage from '@/lib/localStorage';
import { getMeUser } from '@/lib/stores/meUserStore';
import { getApiClient } from '@lactalink/api';
import { Search, User } from '@lactalink/types/payload-generated-types';
import { createStorageKeyByUser } from '@lactalink/utilities';
import { extractID } from '@lactalink/utilities/extractors';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

/**
 * Helper function to create a storage key for the current user
 */
function createStorageKey(user?: User | null) {
  const meUser = user || getMeUser();
  return createStorageKeyByUser(meUser, MMKV_KEYS.SEARCH_HISTORY);
}

/**
 * Get search history from local storage
 */
function getLocalSearchHistory(user?: User | null): Search[] | null {
  const storageKey = createStorageKey(user);
  const storedHistory = localStorage.getString(storageKey);
  if (storedHistory) {
    try {
      const parsedHistory = JSON.parse(storedHistory);
      if (!Array.isArray(parsedHistory)) {
        throw new Error('Invalid search history format');
      }

      return parsedHistory;
    } catch (e) {
      console.warn('Failed to parse search history from storage', e);
      return null;
    }
  }
  return null;
}

/**
 * Get search history from API
 */
async function getSearchHistory(): Promise<Search[] | null> {
  const apiClient = getApiClient();
  const searchIDs = await apiClient.getPreference<Search['id'][] | undefined | null>(
    MMKV_KEYS.SEARCH_HISTORY
  );

  if (!searchIDs || searchIDs.length === 0) {
    return null;
  }

  const result = await apiClient.find({
    collection: 'search',
    pagination: false,
    where: { id: { in: searchIDs } },
  });

  return result;
}

/**
 * Save search history to both local storage and API
 */
async function saveSearchHistory(history: Search[], user?: User | null): Promise<Search[]> {
  const apiClient = getApiClient();
  const storageKey = createStorageKey(user);
  localStorage.set(storageKey, JSON.stringify(history));

  await apiClient.updatePreference(MMKV_KEYS.SEARCH_HISTORY, extractID(history));
  return history;
}

/**
 * Hook for managing search history with React Query
 */
export function useSearchHistory(user?: User | null) {
  const queryClient = useQueryClient();

  // Create a query key based on user
  const historyQueryKey = useMemo(() => [createStorageKey(user)], [user]);

  // Query for fetching search history
  const { data: history, ...queryRest } = useQuery({
    queryKey: historyQueryKey,
    queryFn: async () => {
      return getLocalSearchHistory(user) || (await getSearchHistory());
    },
  });

  // Add item to search history
  const { mutateAsync: addToHistory } = useMutation({
    mutationKey: ['add-to-search-history'],
    mutationFn: async (newItem: Search) => {
      const currentHistory = getLocalSearchHistory(user) || [];
      const existingIndex = currentHistory.findIndex((item) => item.id === newItem.id);
      if (existingIndex !== -1) {
        currentHistory.splice(existingIndex, 1);
      }

      currentHistory.unshift(newItem);
      return saveSearchHistory(currentHistory, user);
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: historyQueryKey });

      const previousHistory = history;

      queryClient.setQueryData<Search[]>(historyQueryKey, (old) => {
        if (!old) return [newItem];
        const existingIndex = old.findIndex((item) => item.id === newItem.id);
        if (existingIndex !== -1) {
          const newArray = [...old]; // Create a copy to avoid mutating the original array
          newArray.splice(existingIndex, 1);
          return [newItem, ...newArray];
        }
        return [newItem, ...old];
      });

      return { previousHistory };
    },
    onError: (_err, _newItem, context) => {
      if (context?.previousHistory) {
        queryClient.setQueryData<Search[]>(historyQueryKey, context.previousHistory);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData<Search[]>(historyQueryKey, data);
    },
  });

  // Clear search history
  const { mutateAsync: clearHistory } = useMutation({
    mutationKey: ['clear-search-history'],
    mutationFn: async () => {
      const apiClient = getApiClient();
      const storageKey = createStorageKey(user);
      localStorage.delete(storageKey);
      await apiClient.updatePreference(MMKV_KEYS.SEARCH_HISTORY, []);
      return [];
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: historyQueryKey });
      const previousHistory = history;
      queryClient.setQueryData<Search[] | null>(historyQueryKey, []);
      return { previousHistory };
    },
    onError: (_err, _newItem, context) => {
      if (context?.previousHistory) {
        queryClient.setQueryData<Search[]>(historyQueryKey, context.previousHistory);
      }
    },
    onSuccess: () => {
      queryClient.setQueryData<Search[] | null>(historyQueryKey, []);
    },
  });

  // Remove item from search history
  const { mutateAsync: removeFromHistory } = useMutation({
    mutationKey: ['remove-from-search-history'],
    mutationFn: async (id: string) => {
      const currentHistory = getLocalSearchHistory(user) || [];
      const newHistory = currentHistory.filter((item) => item.id !== id);
      return saveSearchHistory(newHistory, user);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: historyQueryKey });
      const previousHistory = history;
      queryClient.setQueryData<Search[] | null>(historyQueryKey, (old) => {
        if (!old) return null;
        return old.filter((item) => item.id !== id);
      });
      return { previousHistory };
    },
    onError: (_err, _newItem, context) => {
      if (context?.previousHistory) {
        queryClient.setQueryData<Search[]>(historyQueryKey, context.previousHistory);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData<Search[] | null>(historyQueryKey, data);
    },
  });

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
    ...queryRest,
  };
}
