import { RequestListCard } from '@/components/cards/RequestListCard';
import { ListEmpty } from '@/components/lists/ListEmpty';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Tab } from '@/components/tabs/Tab';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/auth/useAuth';
import { useInfiniteFetchBySlug } from '@/hooks/collections/useInfiniteFetchBySlug';
import { REQUEST_STATUS } from '@lactalink/enums';
import { Collection, CollectionSlug, Request } from '@lactalink/types';
import { formatKebab, formatKebabToTitle } from '@lactalink/utilities';
import { AnimatePresence, Motion } from '@legendapp/motion';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { randomUUID } from 'expo-crypto';
import { PlusIcon } from 'lucide-react-native';
import { createContext, useContext, useMemo, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Route, SceneMap } from 'react-native-tab-view';

type ItemType = Request;

const SLUG: CollectionSlug = 'requests';

const routes: Route[] = Object.values(REQUEST_STATUS).map(({ label, value }) => ({
  key: value,
  title: label,
  accessibilityLabel: label,
  testID: `${SLUG}-tab-${value}`,
  accessible: true,
}));

const scenes: Record<string, React.FC<SceneRendererProps>> = {};

routes.forEach((route) => {
  scenes[route.key] = SceneRenderer;
});

const renderScene = SceneMap(scenes);

const placeholderData: Collection[] = Array.from(
  { length: 30 },
  (_, index) =>
    ({
      id: `placeholder-${index}-${randomUUID()}`,
    }) as Collection
);

type ScrollContextType = {
  scrolledDown: boolean;
  setScrolledDown: (scrolledDown: boolean) => void;
};

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

function useScroll() {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScrollContext must be used within a ScrollProvider');
  }
  return context;
}

interface SceneRendererProps {
  route: Route;
  jumpTo: (key: string) => void;
}

function SceneRenderer({ route }: SceneRendererProps) {
  const { profile } = useAuth();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { scrolledDown, setScrolledDown } = useScroll();
  const previousOffset = useRef(0);

  const {
    data: paginatedData,
    isLoading,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteFetchBySlug(SLUG, Boolean(profile), {
    where: {
      and: [{ status: { equals: route.key } }, { requester: { equals: profile?.id } }],
    },
  });

  const data = useMemo(
    () => paginatedData?.pages?.flatMap((page) => page.docs) || [],
    [paginatedData]
  );

  const renderItem: ListRenderItem<Collection> = ({ item }) => {
    const isLoading = item.id.includes('placeholder');
    return <RequestListCard data={item as ItemType} isLoading={isLoading} />;
  };

  function EmptyComponent() {
    return !isLoading && <ListEmpty title={`No ${formatKebab(SLUG)} found`} />;
  }

  function SeparatorComponent() {
    return <Box className="h-2" />;
  }

  return (
    <Box className="flex-1" style={{ marginBottom: insets.bottom }}>
      <FlashList
        data={isLoading ? placeholderData : data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={EmptyComponent}
        ItemSeparatorComponent={SeparatorComponent}
        ListFooterComponent={isFetchingNextPage ? <Spinner size="small" /> : null}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
        estimatedItemSize={120}
        estimatedListSize={{ width, height }}
        refreshControl={
          <RefreshControl refreshing={!isLoading && isRefetching} onRefresh={refetch} />
        }
        onEndReachedThreshold={0.2}
        onEndReached={hasNextPage && !isFetchingNextPage ? fetchNextPage : undefined}
        onScrollBeginDrag={({ nativeEvent }) => {
          previousOffset.current = nativeEvent.contentOffset.y;
        }}
        onScrollEndDrag={({ nativeEvent }) => {
          const currentOffset = nativeEvent.contentOffset.y;
          const scrollingDown = currentOffset > previousOffset.current;
          if (scrollingDown !== scrolledDown) {
            setScrolledDown(scrollingDown);
          }
        }}
      />
    </Box>
  );
}

export default function ListPage() {
  const [scrolledDown, setScrolledDown] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <SafeArea safeTop={false} safeBottom={false}>
      <ScrollContext.Provider value={{ scrolledDown, setScrolledDown }}>
        <Tab routes={routes} renderScene={renderScene} lazy />
        <AnimatePresence>
          {!scrolledDown && (
            <Motion.View
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
            >
              <Box
                className="bg-background-0 border-outline-200 rounded-2xl border p-4"
                style={{ paddingBottom: insets.bottom }}
              >
                <Button>
                  <ButtonIcon as={PlusIcon} />
                  <ButtonText>Create New {formatKebabToTitle(SLUG)}</ButtonText>
                </Button>
              </Box>
            </Motion.View>
          )}
        </AnimatePresence>
      </ScrollContext.Provider>
    </SafeArea>
  );
}
