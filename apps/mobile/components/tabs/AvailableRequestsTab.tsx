import { useScroll } from '@/components/contexts/ScrollProvider';
import { InfiniteList } from '@/components/lists/InfiniteList';
import { Tab } from '@/components/tabs/Tab';
import { Box } from '@/components/ui/box';
import { useAuth } from '@/hooks/auth/useAuth';
import { useLiveCollectionRevalidator } from '@/hooks/live-updates/useLiveCollectionRevalidator';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { CollectionSlug, Where } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { Stack } from 'expo-router';
import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Route, SceneMap } from 'react-native-tab-view';
import { EditActionButton } from '../buttons';
import { RequestListCard } from '../cards';

type ExtractedSlug = Extract<CollectionSlug, 'requests' | 'hospitals' | 'milkBanks'>;

const routes = createTabRoutes();
const renderScene = createTabSceneMap(routes);

export function AvailableRequestsTab() {
  useLiveCollectionRevalidator('requests', ['UPDATE']);

  return <Tab routes={routes} renderScene={renderScene} />;
}

// #region TabHelpers
function createTabRoutes(): Route[] {
  const routes: { label: string; value: CollectionSlug }[] = [
    { label: 'Public', value: 'requests' },
    { label: 'Milk Banks', value: 'milkBanks' },
    { label: 'Hospitals', value: 'hospitals' },
  ];

  return routes.map(({ label, value }) => ({
    key: value,
    title: label,
    accessibilityLabel: label,
    testID: `available-requests-tab-${value}`,
    accessible: true,
  }));
}

function createTabSceneMap(routes: Route[]) {
  const scenes: Record<string, React.FC<SceneProps>> = {};

  routes.forEach((route) => {
    scenes[route.key] = Scene;
  });

  return SceneMap(scenes);
}

// #endregion

// #region SceneRenderer
interface SceneProps {
  route: Route;
  jumpTo: (key: string) => void;
}

function Scene({ route }: SceneProps) {
  const auth = useAuth();

  const insets = useSafeAreaInsets();
  const { onScrollBeginDrag, onScrollEndDrag, onScroll } = useScroll();

  const collectionSlug = route.key as ExtractedSlug;

  const headerTitle = 'Available Requests';

  const where = useMemo(() => {
    let where: Where | undefined = undefined;
    if (collectionSlug === 'requests') {
      where = { status: { equals: DONATION_REQUEST_STATUS.AVAILABLE.value } };
    }
    return where;
  }, [collectionSlug]);

  return (
    <Box className="flex-1" style={{ marginBottom: insets.bottom }}>
      <Stack.Screen options={{ headerTitle }} />
      <InfiniteList
        slug={collectionSlug}
        fetchOptions={{ where }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
        onScrollBeginDrag={({ nativeEvent }) => onScrollBeginDrag(nativeEvent)}
        onScroll={({ nativeEvent }) => onScroll(nativeEvent)}
        onScrollEndDrag={({ nativeEvent }) => onScrollEndDrag(nativeEvent)}
        ItemComponent={({ item, isLoading }) => {
          if (isLoading) {
            return collectionSlug === 'requests' && <RequestListCard isLoading />;
          }

          if ('requester' in item) {
            const isOwner = (auth.profile && extractID(auth.profile)) === extractID(item.requester);

            return (
              <RequestListCard
                data={item}
                action={isOwner && <EditActionButton href={`/requests/edit/${item.id}`} />}
              />
            );
          }

          return null; // Handle other item types if necessary
        }}
      />
    </Box>
  );
}
// #endregion
