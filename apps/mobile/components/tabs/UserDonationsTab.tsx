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
import { DonationListCard } from '../cards';

const SLUG: Extract<CollectionSlug, 'donations'> = 'donations';

const routes = createTabRoutes();
const renderScene = createTabSceneMap(routes);

export function UserDonationsTab() {
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

  const hasOtherUser = Boolean(userID);
  const isMeUser = !hasOtherUser || userID === meUser.data?.id;

  const {
    data: fetchedUser,
    isLoading,
    error,
    isRefetching,
  } = useFetchById(!isMeUser, {
    collection: 'users',
    id: userID,
    depth: 2,
    select: { profile: true, profileType: true },
  });

  const user = fetchedUser || meUser.data;
  const profile = user?.profile;
  const profileID = profile?.value && extractID(profile.value);

  const otherUserName = (fetchedUser && extractName(fetchedUser)) || 'LactaLink User';
  const titleSlug = formatKebabToTitle(SLUG);

  const headerTitle = useMemo(() => {
    return isMeUser ? `My ${titleSlug}` : otherUserName + `'s ${titleSlug}`;
  }, [isMeUser, titleSlug, otherUserName]);

  const where = useMemo(() => {
    let where: Where | undefined = undefined;
    if (profileID) {
      where = { and: [{ status: { equals: route.key } }, { donor: { equals: profileID } }] };
    }
    return where;
  }, [profileID, route.key]);

  return (
    <Box className="flex-1" style={{ marginBottom: insets.bottom }}>
      <Stack.Screen options={{ headerTitle }} />
      <InfiniteList
        slug={SLUG}
        isLoading={isLoading}
        isFetching={isRefetching}
        fetchOptions={{ where }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
        onScrollBeginDrag={({ nativeEvent }) => onScrollBeginDrag(nativeEvent)}
        onScroll={({ nativeEvent }) => onScroll(nativeEvent)}
        onScrollEndDrag={({ nativeEvent }) => onScrollEndDrag(nativeEvent)}
        ItemComponent={({ item, isLoading }) => {
          if (isLoading) {
            return <DonationListCard isLoading />;
          }

          const isOwner = (profile && extractID(profile.value)) === extractID(item.donor);

          return (
            <DonationListCard
              data={item}
              action={isOwner && <EditActionButton href={`/donations/edit/${item.id}`} />}
            />
          );
        }}
      />
    </Box>
  );
}
// #endregion
