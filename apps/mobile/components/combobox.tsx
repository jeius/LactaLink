import { Collection, CollectionSlug, Where } from '@lactalink/types';
import { getChunks, useDebounce } from '@lactalink/utilities';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NativeScrollEvent } from 'react-native';

import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from '@/components/ui/select';
import { useApiClient } from '@lactalink/api';
import { ChevronDownIcon, LucideSearchX, XIcon } from 'lucide-react-native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { Box } from './ui/box';
import { Button, ButtonIcon } from './ui/button';
import { Divider } from './ui/divider';
import { Icon } from './ui/icon';
import { Input, InputField, InputSlot } from './ui/input';
import { Spinner } from './ui/spinner';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

export type ComboboxType<T extends CollectionSlug = CollectionSlug> = {
  collection: T;
  limit?: number;
  where?: Where;
  searchPath: keyof Collection<T>;
  searchPlaceholder?: string;
};

export type InfiniteScrollComboBoxProps<T extends CollectionSlug = CollectionSlug> =
  ComboboxType<T> & {
    value?: string;
    onChange?: (val: string) => void;
    placeholder?: string;
    isDisabled?: boolean;
  };

function isNearBottom(nativeEvent: NativeScrollEvent, threshold = 300) {
  const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
  return layoutMeasurement.height + contentOffset.y >= contentSize.height - threshold;
}

export default function InfiniteScrollComboBox<T extends CollectionSlug = CollectionSlug>({
  collection,
  limit = 20,
  where: whereParam,
  placeholder,
  value: selected,
  onChange: onSelectionChanged,
  searchPath,
  searchPlaceholder = 'Search here...',
  isDisabled: disabled,
}: InfiniteScrollComboBoxProps<T>) {
  const apiClient = useApiClient();
  const inputRef = useRef<TextInput>(null);
  const [searchDefault, setSearchDefault] = useState('');

  const { data: selectedLabel, isFetching } = useQuery<string>({
    enabled: Boolean(selected),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60,
    refetchOnMount: true,
    queryKey: ['combobox', 'label', selected],
    queryFn: async () => {
      if (selected) {
        const res = await apiClient.findByID({
          id: selected,
          collection,
          depth: 0,
          //@ts-expect-error typescript cant infer here.
          select: { [searchPath]: true },
        });

        return (res[searchPath] as string) || '';
      }
      return '';
    },
  });

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['combobox', collection, debouncedSearch, JSON.stringify(whereParam)],
    initialPageParam: 0,
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60,
    refetchOnMount: true,
    queryFn: async ({ pageParam: page }) => {
      const searchQuery: Where = { [searchPath]: { contains: debouncedSearch.toLowerCase() } };
      const where: Where = whereParam ? { and: [searchQuery, whereParam] } : searchQuery;

      return await apiClient.find({
        collection,
        pagination: true,
        limit,
        where,
        page,
        depth: 0,
        sort: searchPath,
        //@ts-expect-error typescript cant infer here.
        select: { [searchPath]: true },
      });
    },
    getNextPageParam: ({ nextPage }) => nextPage,
  });

  const items = useMemo(() => {
    if (!data) return [];

    const seen = new Set();
    const deduped: (typeof data.pages)[0]['docs'] = [];

    for (const page of data.pages) {
      for (const doc of page.docs) {
        if (!seen.has(doc.id)) {
          seen.add(doc.id);
          deduped.push(doc);
        }
      }
    }

    return deduped;
  }, [data]);

  const [batchCount, setBatchCount] = useState(1);
  const [open, setOpen] = useState(false);

  // Batched items to render
  const batchedItems = useMemo(() => {
    return getChunks(items, limit).slice(0, batchCount).flat();
  }, [items, limit, batchCount]);

  function clearSelection() {
    clearSearch();
    onSelectionChanged?.('');
  }

  function clearSearch() {
    setSearch('');
    setSearchDefault('');
    inputRef.current?.clear();
  }

  function handleScroll({ nativeEvent }: { nativeEvent: NativeScrollEvent }) {
    if (isNearBottom(nativeEvent)) {
      // If there are more items to show, increase batch count
      if (batchCount * limit < items.length) {
        setBatchCount((prev) => prev + 1);
      } else {
        // If all items are shown, fetch next page if available
        fetchNextPage();
      }
    }
  }

  // Reset batchCount when items change or overlay is closed
  useEffect(() => {
    setBatchCount(1);
  }, [debouncedSearch, open]);

  useEffect(() => {
    if (!open) {
      setSearchDefault((prev) => (prev !== search ? search : prev));
    }
  }, [open, search]);

  return (
    <Select
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      isDisabled={disabled}
      selectedValue={selected}
      onValueChange={onSelectionChanged}
    >
      <SelectTrigger disabled={isFetching} variant="outline" size="md">
        <SelectInput
          value={isFetching ? 'Loading...' : selectedLabel || ''}
          className="grow"
          placeholder={placeholder || 'Select option...'}
        />
        {selected && (
          <Button
            isDisabled={disabled || isFetching}
            variant="link"
            className="px-2"
            action="negative"
            onPress={clearSelection}
          >
            <ButtonIcon as={XIcon} />
          </Button>
        )}
        <SelectIcon className="mr-3" as={ChevronDownIcon} />
      </SelectTrigger>
      <SelectPortal>
        <SelectBackdrop />
        <SelectContent className="px-0 pb-0">
          <SelectDragIndicatorWrapper>
            <SelectDragIndicator />
          </SelectDragIndicatorWrapper>

          <Box className="w-full p-5">
            <Input>
              <InputField
                //@ts-expect-error gluestack-ref-issue
                ref={inputRef}
                defaultValue={searchDefault}
                onChangeText={setSearch}
                placeholder={searchPlaceholder}
              />
              {search && (
                <InputSlot onPress={clearSearch} className="pr-3">
                  <Icon as={XIcon} size="sm" className="text-secondary-400" />
                </InputSlot>
              )}
            </Input>
          </Box>

          <Divider orientation="horizontal" className="shadow-sm" />

          <ScrollView
            className="h-64 w-full"
            contentContainerClassName="pb-5"
            scrollEventThrottle={100}
            onScroll={handleScroll}
          >
            {isLoading && <Spinner size="large" className="mt-4" />}
            {batchedItems && batchedItems.length > 0
              ? batchedItems.map((item) => (
                  <SelectItem
                    key={item['id']}
                    label={item[searchPath] as string}
                    value={item['id']}
                  />
                ))
              : !isLoading && (
                  <VStack space="lg" className="mx-auto items-center p-4">
                    <Icon as={LucideSearchX} className="text-primary-500 h-16 w-16" />
                    <Text size="lg">No results found.</Text>
                  </VStack>
                )}
            {hasNextPage && <Spinner size="small" />}
          </ScrollView>
        </SelectContent>
      </SelectPortal>
    </Select>
  );
}
