import { NoData } from '@/components/NoData';
import { RefreshButton } from '@/components/RefreshButton';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VerticalInfiniteList, VerticalInfiniteListProps } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import {
  useNearestDonations,
  useNearestRequests,
} from '@/features/donation&request/hooks/useNearestListings';
import { ListRenderItem } from '@/lib/types';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { listKeyExtractor } from '@lactalink/utilities/extractors';
import { ListRenderItem as FlashListRenderItem } from '@shopify/flash-list';
import React, { useCallback } from 'react';

interface ListProps<T>
  extends Pick<
    VerticalInfiniteListProps<T>,
    'contentContainerClassName' | 'contentContainerStyle'
  > {
  renderItem: ListRenderItem<T>;
  title?: string;
  emptyLabel?: string;
  useBottomSheetListComponent?: boolean;
  hideRefreshButton?: boolean;
}

export function NearestDonationsList({
  renderItem: renderItemProp,
  title,
  emptyLabel = 'No available donations found',
  useBottomSheetListComponent,
  hideRefreshButton = false,
  ...props
}: ListProps<Donation>) {
  const { data, isPlaceholderData, isLoading, isRefetching, refetch, ...query } =
    useNearestDonations();

  const EmptyComponent = useCallback(() => {
    if (isLoading) return null;
    return <ListEmpty label={emptyLabel} />;
  }, [emptyLabel, isLoading]);

  const HeaderComponent = useCallback(() => {
    if (!data.length && !isLoading) return null;
    return (
      <ListHeader
        title={title}
        hideRefreshButton={hideRefreshButton}
        isRefresing={isRefetching}
        onRefresh={refetch}
      />
    );
  }, [data.length, hideRefreshButton, isLoading, isRefetching, refetch, title]);

  const renderItem: FlashListRenderItem<Donation> = useCallback(
    (info) => renderItemProp({ ...info, isPlaceholder: isPlaceholderData }),
    [isPlaceholderData, renderItemProp]
  );

  return (
    <VerticalInfiniteList
      {...props}
      gap={16}
      data={data}
      keyExtractor={listKeyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={HeaderComponent}
      ListHeaderComponentStyle={{ marginBottom: 12 }}
      ListEmptyComponent={EmptyComponent}
      contentContainerStyle={[{ padding: 16 }, props.contentContainerStyle]}
      refreshing={isRefetching}
      onRefresh={refetch}
      fetchNextPage={query.fetchNextPage}
      hasNextPage={query.hasNextPage}
      isFetchingNextPage={query.isFetchingNextPage}
      useBottomSheetListComponent={useBottomSheetListComponent}
    />
  );
}

export function NearestRequestsList({
  renderItem: renderItemProp,
  title,
  emptyLabel = 'No available requests found',
  useBottomSheetListComponent,
  hideRefreshButton = false,
  ...props
}: ListProps<Request>) {
  const { data, isPlaceholderData, isLoading, refetch, isRefetching, ...query } =
    useNearestRequests();

  const EmptyComponent = useCallback(() => {
    if (isLoading) return null;
    return <ListEmpty label={emptyLabel} />;
  }, [emptyLabel, isLoading]);

  const HeaderComponent = useCallback(() => {
    if (!data.length && !isLoading) return null;
    return (
      <ListHeader
        title={title}
        hideRefreshButton={hideRefreshButton}
        isRefresing={isRefetching}
        onRefresh={refetch}
      />
    );
  }, [data.length, hideRefreshButton, isLoading, isRefetching, refetch, title]);

  const renderItem: FlashListRenderItem<Request> = useCallback(
    (info) => renderItemProp({ ...info, isPlaceholder: isPlaceholderData }),
    [isPlaceholderData, renderItemProp]
  );

  return (
    <VerticalInfiniteList
      {...props}
      gap={16}
      data={data}
      keyExtractor={listKeyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={HeaderComponent}
      ListHeaderComponentStyle={{ marginBottom: 12 }}
      ListEmptyComponent={EmptyComponent}
      contentContainerStyle={[{ padding: 16 }, props.contentContainerStyle]}
      refreshing={isRefetching}
      onRefresh={refetch}
      fetchNextPage={query.fetchNextPage}
      hasNextPage={query.hasNextPage}
      isFetchingNextPage={query.isFetchingNextPage}
      useBottomSheetListComponent={useBottomSheetListComponent}
    />
  );
}

function ListEmpty({ label }: { label: string }) {
  return (
    <Box className="pt-10">
      <NoData title={label} />
    </Box>
  );
}

function ListHeader({
  title,
  isRefresing,
  onRefresh,
  hideRefreshButton,
}: {
  title?: string;
  isRefresing: boolean;
  onRefresh: () => void;
  hideRefreshButton?: boolean;
}) {
  return (
    <HStack space="lg" className="items-center justify-between">
      {title && <Text className="font-JakartaSemiBold">{title}</Text>}
      {!hideRefreshButton && <RefreshButton refreshing={isRefresing} onRefresh={onRefresh} />}
    </HStack>
  );
}
