import { MMKV_KEYS } from '@/lib/constants';
import Storage from '@/lib/localStorage';
import { getApiClient } from '@lactalink/api';
import { User, UserSearch } from '@lactalink/types/payload-generated-types';
import { mutationOptions } from '@tanstack/react-query';
import { produce } from 'immer';
import { createSearchHistoryQueryOptions } from './queryOptions';
import { createStorageKey, getLocalSearchHistory, saveSearchHistory } from './utils';

export function createAddToHistoryMutationOptions(user: User | null) {
  const historyQueryOptions = createSearchHistoryQueryOptions(user);
  const queryKey = historyQueryOptions.queryKey;

  return mutationOptions({
    mutationKey: ['add-to-search-history'],
    mutationFn: async (newItem: UserSearch) => {
      const currentHistory = getLocalSearchHistory(user) || [];
      const existingIndex = currentHistory.findIndex((item) => item.id === newItem.id);
      if (existingIndex !== -1) {
        currentHistory.splice(existingIndex, 1);
      }

      currentHistory.unshift(newItem);
      return saveSearchHistory(currentHistory, user);
    },
    onMutate: async (newItem, { client }) => {
      await client.cancelQueries(historyQueryOptions);

      const previousHistory = client.getQueryData(queryKey);

      client.setQueryData(queryKey, (old) => {
        if (!old) return [newItem];
        return produce(old, (draft) => {
          const existingIndex = old.findIndex((item) => item.id === newItem.id);
          // If new item already exists, remove it before unshifting
          if (existingIndex !== -1) draft.splice(existingIndex, 1);
          // Always add the new item to the front
          draft.unshift(newItem);
        });
      });

      return { previousHistory };
    },
    onError: (_err, _newItem, ctx, { client }) => {
      if (ctx) {
        client.setQueryData(queryKey, ctx.previousHistory);
      }
    },
    onSuccess: (data, _vars, _ctx, { client }) => {
      client.setQueryData(queryKey, data);
    },
    onSettled: (_data, _error, _vars, _ctx, { client }) => {
      client.invalidateQueries(historyQueryOptions);
    },
  });
}

export function createClearHistoryMutationOptions(user: User | null) {
  const historyQueryOptions = createSearchHistoryQueryOptions(user);
  const queryKey = historyQueryOptions.queryKey;
  return mutationOptions({
    mutationKey: ['clear-search-history'],
    mutationFn: () => {
      const apiClient = getApiClient();
      const storageKey = createStorageKey(user);
      Storage.delete(storageKey);
      return apiClient.updatePreference(MMKV_KEYS.SEARCH_HISTORY, []);
    },
    onMutate: async (_, { client }) => {
      await client.cancelQueries(historyQueryOptions);

      const previousHistory = client.getQueryData(queryKey);

      client.setQueryData(queryKey, []);

      return { previousHistory };
    },
    onError: (_err, _newItem, ctx, { client }) => {
      if (ctx) {
        client.setQueryData(queryKey, ctx.previousHistory);
      }
    },
    onSuccess: (data, _vars, _ctx, { client }) => {
      client.setQueryData(queryKey, data);
    },
    onSettled: (_data, _error, _vars, _ctx, { client }) => {
      client.invalidateQueries(historyQueryOptions);
    },
  });
}

export function createRemoveFromHistoryMutationOptions(user: User | null) {
  const historyQueryOptions = createSearchHistoryQueryOptions(user);
  const queryKey = historyQueryOptions.queryKey;
  return mutationOptions({
    mutationKey: ['remove-from-search-history'],
    mutationFn: async (id: string, { client }) => {
      const currentHistory = client.getQueryData(queryKey);
      if (!currentHistory) {
        throw new Error('No search history to remove from');
      }
      // Remove item with matching id
      const newHistory = currentHistory.filter((item) => item.id !== id);
      return saveSearchHistory(newHistory, user);
    },
    onMutate: async (id, { client }) => {
      await client.cancelQueries(historyQueryOptions);

      const previousHistory = client.getQueryData(queryKey);
      client.setQueryData(queryKey, (old) => {
        if (!old) return old;
        // Remove item with matching id
        return old.filter((item) => item.id !== id);
      });
      return { previousHistory };
    },
    onError: (_err, _newItem, ctx, { client }) => {
      if (ctx) {
        client.setQueryData(queryKey, ctx.previousHistory);
      }
    },
    onSuccess: (data, _vars, _ctx, { client }) => {
      client.setQueryData(queryKey, data);
    },
    onSettled: (_data, _error, _vars, _ctx, { client }) => {
      client.invalidateQueries(historyQueryOptions);
    },
  });
}
