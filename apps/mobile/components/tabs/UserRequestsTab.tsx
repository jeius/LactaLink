import { useScroll } from '@/components/contexts/ScrollProvider';
import { InfiniteList } from '@/components/lists/InfiniteList';
import { Tab } from '@/components/tabs/Tab';
import { Box } from '@/components/ui/box';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { useLiveCollectionRevalidator } from '@/hooks/live-updates/useLiveCollectionRevalidator';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { CollectionSlug, Where } from '@lactalink/types';
import { extractID, extractName, formatKebabToTitle } from '@lactalink/utilities';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Route, SceneMap } from 'react-native-tab-view';
import { EditActionButton } from '../buttons';
import { RequestListCard } from '../cards';

const SLUG: Extract<CollectionSlug, 'requests'> = 'requests';

const routes = createTabRoutes();
const renderScene = createTabSceneMap(routes);

export function UserRequestsTab() {
  useLiveCollectionRevalidator(SLUG, ['UPDATE']);
  return <Tab routes={routes} renderScene={renderScene} />;
}

// #region TabHelpers
function createTabRoutes(): Route[] {
  const routes = Object.values(DONATION_REQUEST_STATUS);

  return routes.map(({ label, value }) => ({
    key: value,
    title: label,
    accessibilityLabel: label,
    testID: `${SLUG}-tab-${value}`,
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
  const { userID } = useLocalSearchParams<{ userID?: string }>();
  const meUser = useMeUser();

  const insets = useSafeAreaInsets();
  const { onScrollBeginDrag, onScrollEndDrag, onScroll } = useScroll();

  const hasUser = Boolean(userID);
  const isMeUser = userID === meUser.data?.id;

  const {
    data: fetchedUser,
    isLoading,
    error,
    isFetching,
  } = useFetchById(hasUser && !isMeUser, {
    collection: 'users',
    id: userID,
    depth: 2,
    select: { profile: true, profileType: true },
  });

  const user = fetchedUser || meUser.data;
  const profile = user?.profile;
  const profileID = profile?.value && extractID(profile.value);

  const headerTitle = useMemo(() => {
    return hasUser
      ? isMeUser
        ? `My ${formatKebabToTitle(SLUG)}`
        : (fetchedUser && extractName(fetchedUser) + `'s ${formatKebabToTitle(SLUG)}`) ||
          formatKebabToTitle(SLUG)
      : `Open ${formatKebabToTitle(SLUG)}`;
  }, [hasUser, isMeUser, fetchedUser]);

  const where = useMemo(() => {
    let where: Where | undefined = undefined;
    if (hasUser && profile && profileID && profile.relationTo === 'individuals') {
      where = { and: [{ status: { equals: route.key } }, { donor: { equals: profileID } }] };
    }
    return where;
  }, [hasUser, profile, profileID, route.key]);

  return (
    <Box className="flex-1" style={{ marginBottom: insets.bottom }}>
      <Stack.Screen options={{ headerTitle }} />
      <InfiniteList
        slug={SLUG}
        isLoading={isLoading}
        isFetching={isFetching}
        fetchOptions={{ where }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
        onScrollBeginDrag={({ nativeEvent }) => onScrollBeginDrag(nativeEvent)}
        onScroll={({ nativeEvent }) => onScroll(nativeEvent)}
        onScrollEndDrag={({ nativeEvent }) => onScrollEndDrag(nativeEvent)}
        ItemComponent={({ item, isLoading }) => {
          if (isLoading) {
            return <RequestListCard isLoading />;
          }

          const isOwner = (profile && extractID(profile.value)) === extractID(item.requester);

          return (
            <RequestListCard
              data={item}
              action={isOwner && <EditActionButton href={`/requests/edit/${item.id}`} />}
            />
          );
        }}
      />
    </Box>
  );
}
// #endregion
