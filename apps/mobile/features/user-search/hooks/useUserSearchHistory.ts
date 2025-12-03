import { User } from '@lactalink/types/payload-generated-types';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createAddToHistoryMutationOptions,
  createClearHistoryMutationOptions,
  createRemoveFromHistoryMutationOptions,
} from '../lib/mutationOptions';
import { createSearchHistoryQueryOptions } from '../lib/queryOptions';

/**
 * Hook for managing search history with React Query
 */
export function useUserSearchHistory(user: User | null) {
  // Query for fetching search history
  const { data: history, ...queryRest } = useQuery(createSearchHistoryQueryOptions(user));

  // Add item to search history
  const { mutateAsync: addToHistory } = useMutation(createAddToHistoryMutationOptions(user));

  // Clear search history
  const { mutateAsync: clearHistory } = useMutation(createClearHistoryMutationOptions(user));

  // Remove item from search history
  const { mutateAsync: removeFromHistory } = useMutation(
    createRemoveFromHistoryMutationOptions(user)
  );

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
    ...queryRest,
  };
}
