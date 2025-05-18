import { useSession } from '@/hooks/auth/useSession';
import { API_URL, VERCEL_BYPASS_TOKEN } from '@/lib/constants';
import { Collections, CollectionSlug, HasNameCollection, Where } from '@lactalink/types';
import { apiFetch, comboBoxFetcher, useDebounce } from '@lactalink/utilities';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';

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
import { ChevronDownIcon, XIcon } from 'lucide-react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Box } from './ui/box';
import { Divider } from './ui/divider';
import { Icon } from './ui/icon';
import { Input, InputField, InputSlot } from './ui/input';
import { Spinner } from './ui/spinner';

export type InfiniteComboBoxProps = {
  selected?: string;
  onSelectionChanged?: (val: string) => void;
  collection: CollectionSlug;
  limit?: number;
  placeholder?: string;
  where?: Where;
};

export default function InfiniteComboBox({
  collection,
  limit = 10,
  where,
  placeholder,
  selected,
  onSelectionChanged,
}: InfiniteComboBoxProps) {
  const { token } = useSession();
  const { data: selectedLabel } = useQuery({
    initialData: '',
    enabled: Boolean(selected),
    queryKey: ['combobox', 'label', selected],
    queryFn: async () => {
      const url = new URL(`/api/${collection}/${selected}`, API_URL);
      if (!token) {
        throw new Error('Invalid session.');
      }
      const res = await apiFetch<HasNameCollection<Collections>>({
        token,
        method: 'GET',
        url,
        vercelToken: VERCEL_BYPASS_TOKEN,
      });

      if ('error' in res) {
        throw res.error;
      }

      return res.data.name;
    },
  });

  const [search, setSearch] = useState(selectedLabel);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['combobox', collection, debouncedSearch, JSON.stringify(where)],
    initialPageParam: 1,
    queryFn: ({ pageParam: page }) =>
      comboBoxFetcher(debouncedSearch, page, {
        collection,
        token,
        vercelToken: VERCEL_BYPASS_TOKEN,
        apiUrl: API_URL,
        limit,
        where,
      }),
    getNextPageParam: ({ nextPage }) => nextPage,
    staleTime: Infinity,
    refetchOnMount: true,
  });

  useEffect(() => {
    setSearch(selectedLabel);
  }, [selectedLabel]);

  function clearSelection() {
    setSearch('');
    if (onSelectionChanged) onSelectionChanged('');
  }

  return (
    <Select selectedValue={selected} onValueChange={onSelectionChanged}>
      <SelectTrigger variant="outline" size="md">
        <SelectInput value={search} className="grow" placeholder={placeholder || 'Select option'} />
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
                className="w-full"
                defaultValue={search}
                onChangeText={setSearch}
                placeholder="Search..."
              />
              {search && (
                <InputSlot onPress={clearSelection} className="pr-3">
                  <Icon as={XIcon} size="sm" className="text-typography-500" />
                </InputSlot>
              )}
            </Input>
          </Box>

          <Divider orientation="horizontal" className="shadow-sm" />

          <ScrollView
            className="h-64 w-full"
            contentContainerClassName="pb-5"
            scrollEventThrottle={100}
            onScroll={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              const isNearBottom =
                layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;

              if (isNearBottom) {
                fetchNextPage();
              }
            }}
          >
            {isLoading && <Spinner size="small" className="mt-4" />}
            {data?.pages.flatMap(({ docs }) =>
              docs.map(({ id, name }) => <SelectItem key={id} label={name} value={id} />)
            )}
            {hasNextPage && <Spinner size="small" />}
          </ScrollView>
        </SelectContent>
      </SelectPortal>
    </Select>
  );
}
