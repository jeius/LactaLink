import { UserProfile } from '@lactalink/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { useMemo, useState } from 'react';
import { createUserInfiniteQueryOptions } from '../lib/queryOptions';

type Params = {
  /**
   * Debounce time in milliseconds for the search input. Defaults to 300ms.
   * This helps to reduce the number of API calls while the user is typing.
   */
  debounceTime?: number;
  /**
   * Array of user profile types to filter the search results. If provided,
   * only users with matching profile types will be included in the search results.
   */
  profileTypes?: UserProfile['relationTo'][];
};

/**
 * Hook for handling search functionality
 */
export function useUserSearch({ debounceTime = 300, profileTypes }: Params = {}) {
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce the search term update to avoid excessive API calls
  const debouncedSetSearch = useMemo(() => debounce(setSearchTerm, debounceTime), [debounceTime]);

  // Only search if the search term has more than 1 character
  const willSearch = searchTerm.length > 1;

  const queryOptions = useMemo(
    () => createUserInfiniteQueryOptions(searchTerm, { profileTypes }),
    [searchTerm, profileTypes]
  );

  // Use the infinite query hook for search results
  const query = useInfiniteQuery(queryOptions);

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
