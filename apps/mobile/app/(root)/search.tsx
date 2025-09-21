import { HeaderBackButton } from '@/components/HeaderBackButton';
import { NoData } from '@/components/NoData';
import { RefreshControl } from '@/components/RefreshControl';
import { SearchHeader } from '@/components/SearchHeader';
import { SearchItem } from '@/components/SearchItem';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useSearch } from '@/hooks/useSearch';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { Search } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { FlashList } from '@shopify/flash-list';
import { Stack, useRouter } from 'expo-router';
import { XIcon } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
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
    isLoading,
    isRefetching,
    refetch,
    searchResults,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useSearch();

  const { history, addToHistory, clearHistory, removeFromHistory } = useSearchHistory(meUser);

  // Focus the search input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Clear the search input field
  function handleClearSearch() {
    clearSearch();
    inputRef.current?.clear();
  }

  // Handle selecting a search result
  function onSelect(item: Search) {
    const { doc } = item;
    addToHistory(item);
    router.push(`/profile/${doc.relationTo}/${extractID(doc.value)}`);
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <VStack
        style={{ paddingBottom: insets.bottom }}
        className="flex-1 items-stretch justify-start"
      >
        <HStack
          style={{ paddingTop: insets.top + 8, paddingBottom: 8 }}
          className="bg-background-0 px-5"
        >
          <HeaderBackButton />

          <Input size="md" variant="rounded" className="flex-1">
            <InputField
              //@ts-expect-error Gluestack ref type mismatch
              ref={inputRef}
              placeholder="Search donors, hospitals, milk banks..."
              defaultValue={searchTerm}
              onChangeText={setSearchTerm}
              keyboardType="web-search"
              autoCorrect={false}
              autoCapitalize="words"
              autoComplete="name"
            />
            {searchTerm && (
              <InputSlot>
                <Button
                  size="sm"
                  variant="link"
                  action="default"
                  className="mr-4 h-fit w-fit p-0"
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
          <FlashList
            data={willSearch ? searchResults : history || []}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="grow"
            ListHeaderComponent={
              <SearchHeader
                isSearchMode={willSearch}
                isLoading={isLoading}
                history={history}
                onClearHistory={clearHistory}
              />
            }
            ListEmptyComponent={() => !isLoading && <NoData title="No results found" />}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            onEndReachedThreshold={0.2}
            onEndReached={hasNextPage && !isFetchingNextPage ? fetchNextPage : undefined}
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
    </>
  );
}
