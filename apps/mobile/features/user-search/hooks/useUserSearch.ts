import { useInfiniteQuery } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { useMemo, useState } from 'react';
import { createUserInfiniteQueryOptions } from '../lib/queryOptions';

/**
 * Hook for handling search functionality
 */
export function useUserSearch(debounceTime = 300) {
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce the search term update to avoid excessive API calls
  const debouncedSetSearch = useMemo(() => debounce(setSearchTerm, debounceTime), [debounceTime]);

  // Only search if the search term has more than 1 character
  const willSearch = searchTerm.length > 1;

  // Use the infinite query hook for search results
  const query = useInfiniteQuery(createUserInfiniteQueryOptions(searchTerm));

  // Flatten the search results for easier consumption
  const searchResults = useMemo(
    () => query.data?.pages.flatMap((page) => page.docs) || [],
    [query.data?.pages]
  );

  // Clear the search term
  const clearSearch = () => {
    setSearchTerm('');
  };

  return {
    searchTerm,
    setSearchTerm: debouncedSetSearch,
    clearSearch,
    willSearch,
    searchResults,
    ...query,
  };
}
