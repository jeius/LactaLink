import { useInfiniteFetchBySlug } from '@/hooks/collections/useInfiniteFetchBySlug';
import debounce from 'lodash/debounce';
import { useMemo, useState } from 'react';

/**
 * Hook for handling search functionality
 */
export function useSearch(debounceTime = 300) {
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce the search term update to avoid excessive API calls
  const debouncedSetSearch = useMemo(() => debounce(setSearchTerm, debounceTime), [debounceTime]);

  // Only search if the search term has more than 1 character
  const willSearch = searchTerm.length > 1;

  // Use the infinite fetch hook for search results
  const query = useInfiniteFetchBySlug(willSearch, {
    collection: 'search',
    where: { title: { contains: searchTerm } },
    limit: 10,
  });

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
