import { Donation, Request } from '@lactalink/types/payload-generated-types';

import { DonationListCard, RequestListCard } from '@/components/cards';
import { NoData } from '@/components/NoData';
import { RefreshButton } from '@/components/RefreshButton';
import { RefreshControl } from '@/components/RefreshControl';
import { BottomSheetFlashList } from '@/components/ui/bottom-sheet';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useFetchNearest } from '@/hooks/collections/useFetchNearest';
import { DonationCreateSearchParams, RequestSearchParams } from '@/lib/types/donationRequest';
import { generatePlaceHolders } from '@lactalink/utilities';
import { formatKebab } from '@lactalink/utilities/formatters';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { capitalize } from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { GestureResponderEvent } from 'react-native';
import { SceneProps } from './types';

export function DonationRequestScene<T extends Donation | Request = Donation | Request>({
  route,
  useBottomSheetList = false,
  onPress,
  canViewThumbnails: canViewImage = true,
}: SceneProps<T>) {
  const res = useFetchNearest(route.key as 'donations' | 'requests');
  const router = useRouter();

  const placeholders = useMemo(
    () => generatePlaceHolders(20, { id: 'placeholder' } as Donation | Request),
    []
  );

  const data = useMemo(
    () => res.data?.pages.flatMap((p) => p?.docs).filter((v) => v !== undefined) || [],
    [res.data]
  );

  const renderItem: ListRenderItem<T> = useCallback(
    ({ item }) => {
      const isLoading = item.id.includes('placeholder');

      function Action() {
        let actionButtonLabel = '';
        switch (route.key) {
          case 'donations':
            actionButtonLabel = 'Request';
            break;
          case 'requests':
            actionButtonLabel = 'Donate';
            break;
          default:
            actionButtonLabel = 'View';
            break;
        }

        function handleAction(e: GestureResponderEvent) {
          e.stopPropagation();

          if (route.key === 'donations') {
            const params: RequestSearchParams = {
              matchedDonation: item.id,
            };
            router.push({ pathname: '/requests/create', params });
          } else if (route.key === 'requests') {
            const params: DonationCreateSearchParams = {
              matchedRequest: item.id,
            };
            router.push({ pathname: '/donations/create', params });
          }
        }

        return (
          <VStack space="sm" className="items-center justify-center">
            <Button size="sm" onPress={handleAction}>
              <ButtonText>{actionButtonLabel}</ButtonText>
            </Button>
          </VStack>
        );
      }

      switch (route.key) {
        case 'donations': {
          return (
            <DonationListCard
              //@ts-expect-error Generic type mismatch
              onPress={onPress}
              isLoading={isLoading}
              data={item as Donation}
              showAvatar
              showMinDistance
              canViewThumbnail={canViewImage}
              action={<Action />}
            />
          );
        }

        case 'requests': {
          return (
            <RequestListCard
              //@ts-expect-error Generic type mismatch
              onPress={onPress}
              isLoading={isLoading}
              data={item as Request}
              showAvatar
              showMinDistance
              isImageViewable={canViewImage}
              action={<Action />}
            />
          );
        }

        default:
          return null;
      }
    },
    [canViewImage, onPress, route.key, router]
  );

  function EmptyComponent() {
    return (
      !res.isLoading && (
        <Box className="pt-10">
          <NoData title={`No available ${formatKebab(route.key)} found`} />
        </Box>
      )
    );
  }

  function HeaderComponent() {
    if (!data.length && !res.isLoading) return null;
    return (
      <HStack space="lg" className="items-center justify-between">
        <Text className="font-JakartaSemiBold">Available {capitalize(route.key)}</Text>
        <RefreshButton refreshing={res.isRefetching} onRefresh={res.refetch} />
      </HStack>
    );
  }

  return useBottomSheetList ? (
    <BottomSheetFlashList
      //@ts-expect-error Generic type mismatch
      data={res.isLoading ? placeholders : data}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      ListHeaderComponent={HeaderComponent}
      ListHeaderComponentStyle={{ marginBottom: 12 }}
      ListEmptyComponent={EmptyComponent}
      ItemSeparatorComponent={() => <Box style={{ height: 16 }} />}
      ListFooterComponent={res.isFetchingNextPage ? <Spinner size="small" /> : null}
      onEndReachedThreshold={0.2}
      onEndReached={res.hasNextPage && !res.isFetchingNextPage ? res.fetchNextPage : undefined}
      contentContainerStyle={{ padding: 16 }}
    />
  ) : (
    <FlashList
      //@ts-expect-error Generic type mismatch
      data={res.isLoading ? placeholders : data}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      ListHeaderComponent={HeaderComponent}
      ListHeaderComponentStyle={{ marginBottom: 12 }}
      ListEmptyComponent={EmptyComponent}
      ItemSeparatorComponent={() => <Box style={{ height: 16 }} />}
      ListFooterComponent={res.isFetchingNextPage ? <Spinner size="small" /> : null}
      onEndReachedThreshold={0.2}
      onEndReached={res.hasNextPage && !res.isFetchingNextPage ? res.fetchNextPage : undefined}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={res.isRefetching} onRefresh={res.refetch} />}
    />
  );
}
