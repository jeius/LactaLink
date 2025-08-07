import { CollectionSlug, Donation, Request } from '@lactalink/types';
import { Route, SceneMap } from 'react-native-tab-view';

import { useFetchNearest } from '@/hooks/collections/useFetchNearest';
import { getIconAsset } from '@/lib/stores';
import { formatKebab } from '@lactalink/utilities';
import { ListRenderItem } from '@shopify/flash-list';
import { capitalize } from 'lodash';
import { RefreshCwIcon } from 'lucide-react-native';
import React, { useCallback, useMemo } from 'react';
import { RotatingView } from '../animated/RotatingView';
import { DonationListCard, RequestListCard } from '../cards';
import { Image } from '../Image';
import { NoData } from '../NoData';
import { BottomSheetFlashList } from '../ui/bottom-sheet';
import { Box } from '../ui/box';
import { Button, ButtonIcon } from '../ui/button';
import { HStack } from '../ui/hstack';
import { Spinner } from '../ui/spinner';
import { Text } from '../ui/text';
import { Tab } from './Tab';
import { TabBar } from './TabBar';

export function DonationsRequestsTab() {
  const { routes, sceneMap } = createRoutesAndScenes();
  return (
    <Tab
      renderTabBar={(props) => <TabBar {...props} scrollEnabled={false} />}
      routes={routes}
      renderScene={sceneMap}
    />
  );
}

// #region TabHelpers
function createRoutesAndScenes() {
  const routes: { label: string; value: CollectionSlug }[] = [
    { label: 'Donations', value: 'donations' },
    { label: 'Requests', value: 'requests' },
  ];

  const scenes: Record<string, React.FC<SceneProps>> = {};

  const sceneRoutes: Route[] = routes.map(({ label, value }) => {
    scenes[value] = Scene;

    return {
      key: value,
      title: label,
      accessibilityLabel: label,
      testID: `available-${value}-tab`,
      accessible: true,
    };
  });

  return { routes: sceneRoutes, sceneMap: SceneMap(scenes) };
}

// #endregion

interface SceneProps {
  route: Route;
  jumpTo: (key: string) => void;
}

function Scene({ route }: SceneProps) {
  const res = useFetchNearest(route.key as 'donations' | 'requests');

  const data = useMemo(
    () => res.data?.pages.flatMap((p) => p?.docs).filter((v) => v !== undefined) || [],
    [res.data]
  );

  const icon = getIconAsset(route.key === 'requests' ? 'milkBasket' : 'receiveMilk');

  const renderItem: ListRenderItem<Donation | Request> = useCallback(
    ({ item }) => {
      const isLoading = item.id.includes('placeholder');

      switch (route.key) {
        case 'donations':
          return <DonationListCard isLoading={isLoading} data={item as Donation} />;

        case 'requests':
          return <RequestListCard isLoading={isLoading} data={item as Request} />;

        default:
          return null;
      }
    },
    [route.key]
  );

  function EmptyComponent() {
    return (
      !res.isLoading && (
        <Box className="mx-auto mt-10 w-2/3">
          <NoData title={`No available ${formatKebab(route.key)} found`} />
        </Box>
      )
    );
  }

  function HeaderComponent() {
    return (
      <HStack space="lg" className="items-center justify-between">
        <HStack space="sm" className="items-center">
          <Image source={icon} style={{ width: 24, aspectRatio: 1 }} />
          <Text className="font-JakartaSemiBold">Available {capitalize(route.key)}</Text>
        </HStack>
        <RotatingView enable={res.isRefetching}>
          <Button
            isDisabled={res.isRefetching}
            variant="link"
            onPress={res.refetch}
            action="default"
            className="h-fit w-fit"
            size="sm"
            hitSlop={10}
          >
            <ButtonIcon as={RefreshCwIcon} />
          </Button>
        </RotatingView>
      </HStack>
    );
  }

  return (
    <BottomSheetFlashList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      ListHeaderComponent={HeaderComponent}
      ListHeaderComponentStyle={{ marginBottom: 12 }}
      ListEmptyComponent={EmptyComponent}
      ItemSeparatorComponent={() => <Box className="h-4" />}
      ListFooterComponent={res.isFetchingNextPage ? <Spinner size="small" /> : null}
      onEndReachedThreshold={0.2}
      onEndReached={res.hasNextPage && !res.isFetchingNextPage ? res.fetchNextPage : undefined}
      contentContainerStyle={{ padding: 16 }}
    />
  );
}
