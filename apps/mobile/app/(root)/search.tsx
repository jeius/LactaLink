import { HeaderBackButton } from '@/components/HeaderBackButton';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { InfiniteFlashList } from '@/components/ui/list';
import { Spinner } from '@/components/ui/spinner';
import { VStack } from '@/components/ui/vstack';
import { SearchHeader } from '@/features/user-search/components/SearchHeader';
import SearchItem from '@/features/user-search/components/SearchItem';
import { useUserSearch } from '@/features/user-search/hooks/useUserSearch';
import { useUserSearchHistory } from '@/features/user-search/hooks/useUserSearchHistory';
import { useMeUser } from '@/hooks/auth/useAuth';
import { UserSearch as Search } from '@lactalink/types/payload-generated-types';
import { extractID, listKeyExtractor } from '@lactalink/utilities/extractors';
import { useRouter } from 'expo-router';
import { SearchIcon, XIcon } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SearchPage() {
  const { data: meUser } = useMeUser();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();

  // Custom hooks for search and search history
  const {
    searchTerm,
    setSearchTerm,
    clearSearch,
    willSearch,
    isRefetching,
    refetch,
    searchResults,
    ...searchQuery
  } = useUserSearch();

  const { history, addToHistory, clearHistory, removeFromHistory } = useUserSearchHistory(meUser);

  const [inputValue, setInputValue] = useState(searchTerm);

  // Focus the search input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Clear the search input field
  function handleClearSearch() {
    clearSearch();
    setInputValue('');
  }

  // Handle selecting a search result
  function onSelect(item: Search) {
    const { doc } = item;
    addToHistory(item);
    router.push(`/profile/${doc.relationTo}/${extractID(doc.value)}`);
  }

  return (
    <VStack style={{ paddingBottom: insets.bottom }} className="flex-1 items-stretch justify-start">
      <HStack
        style={{ paddingTop: insets.top + 8, paddingBottom: 8 }}
        className="bg-background-0 px-2"
      >
        <HeaderBackButton />

        <Input size="md" variant="rounded" className="mx-2 flex-1">
          <InputSlot className="ml-2">
            <InputIcon as={SearchIcon} />
          </InputSlot>
          <InputField
            ref={inputRef}
            className="px-2"
            placeholder="Search donors, hospitals, milk banks..."
            value={inputValue}
            onChangeText={(text) => {
              setInputValue(text);
              setSearchTerm(text);
            }}
            keyboardType="web-search"
            autoCorrect={false}
            autoCapitalize="words"
            autoComplete="name"
          />
          {searchQuery.isFetching && (
            <InputSlot className="mr-2">
              <Spinner size={'small'} />
            </InputSlot>
          )}
          {searchTerm && (
            <InputSlot aria-label="Clear Search" role="button">
              <Button
                size="sm"
                variant="ghost"
                action="default"
                className="mr-2 h-fit w-fit rounded-full p-2"
                onPress={handleClearSearch}
                hitSlop={8}
              >
                <ButtonIcon as={XIcon} />
              </Button>
            </InputSlot>
          )}
        </Input>
      </HStack>
      <Divider />
      <Box className="w-full flex-1">
        <InfiniteFlashList
          {...searchQuery}
          data={willSearch ? searchResults : history || []}
          keyExtractor={listKeyExtractor}
          refreshing={isRefetching}
          onRefresh={refetch}
          emptyListLabel="No results found"
          ListHeaderComponent={
            <SearchHeader
              isSearchMode={willSearch}
              history={history}
              onClearHistory={clearHistory}
            />
          }
          renderItem={({ item }) => (
            <SearchItem
              item={item}
              isSearchMode={willSearch}
              onPress={onSelect}
              onRemove={removeFromHistory}
            />
          )}
        />
      </Box>
    </VStack>
  );
}
