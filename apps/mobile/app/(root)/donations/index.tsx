import { BottomSheetActionButton } from '@/components/buttons';
import { DonationListCard } from '@/components/cards/DonationListCard';
import { useScroll } from '@/components/contexts/ScrollProvider';
import { InfiniteList, InfiniteListItemProps } from '@/components/lists/InfiniteList';
import SafeArea from '@/components/SafeArea';
import { Tab } from '@/components/tabs/Tab';
import { Box } from '@/components/ui/box';
import { useAuth } from '@/hooks/auth/useAuth';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { useLiveCollectionRevalidator } from '@/hooks/live-updates/useLiveCollectionRevalidator';
import { DONATION_REQUEST_STATUS, DONATION_STATUS } from '@lactalink/enums';
import { CollectionSlug, Donation, Where } from '@lactalink/types';
import { extractID, extractName, formatKebabToTitle } from '@lactalink/utilities';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';
import { FC, useCallback, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Route, SceneMap } from 'react-native-tab-view';

type DataType = Donation;

const SLUG: CollectionSlug = 'donations';

export default function ListPage() {
  const router = useRouter();
  const { userID } = useLocalSearchParams<{ userID?: string }>();
  const { user } = useAuth();
  const { scrolledDown } = useScroll();

  useLiveCollectionRevalidator(SLUG, ['UPDATE']);

  const hasUser = Boolean(userID);
  const isOwner = user?.id === userID;

  const routes = createTabRoutes(userID);
  const renderScene = createTabSceneMap(routes, userID);

  function handleCreateNew() {
    // @ts-expect-error This is a workaround for the router type issue
    router.push(`/${SLUG}/create`);
  }

  return (
    <SafeArea safeTop={false} safeBottom={false}>
      <Tab routes={routes} renderScene={renderScene} lazy />
      <BottomSheetActionButton
        show={(isOwner && !scrolledDown) || !hasUser}
        icon={PlusIcon}
        label={`Create New ${formatKebabToTitle(SLUG)}`}
        onPress={handleCreateNew}
      />
    </SafeArea>
  );
}

// #region TabHelpers
function createTabRoutes(userID?: string): Route[] {
  let routes: { label: string; value: string }[] = Object.values(DONATION_REQUEST_STATUS);

  if (!userID) {
    const routeValues: { label: string; value: CollectionSlug }[] = [
      { label: 'Donors', value: 'individuals' },
      { label: 'Milk Banks', value: 'milkBanks' },
      { label: 'Hospitals', value: 'hospitals' },
    ];
    routes = routeValues;
  }

  return routes.map(({ label, value }) => ({
    key: value,
    title: label,
    accessibilityLabel: label,
    testID: `${SLUG}-tab-${value}`,
    accessible: true,
  }));
}

function createTabSceneMap(routes: Route[], userID?: string) {
  const scenes: Record<string, React.FC<SceneRendererProps>> = {};

  routes.forEach((route) => {
    scenes[route.key] = SceneRenderer;
  });

  return SceneMap(scenes);
}
// #endregion

// #region SceneRenderer
interface SceneRendererProps {
  route: Route;
  jumpTo: (key: string) => void;
}

function SceneRenderer({ route }: SceneRendererProps) {
  const { userID } = useLocalSearchParams<{ userID?: string }>();
  const auth = useAuth();

  const insets = useSafeAreaInsets();
  const { onScrollBeginDrag, onScrollEndDrag } = useScroll();

  const hasUser = Boolean(userID);
  const isAuthenticatedUser = userID === auth.user?.id;

  const {
    data: fetchedUser,
    isLoading,
    error,
    isFetching,
  } = useFetchById(hasUser && !isAuthenticatedUser, {
    collection: 'users',
    id: userID,
    depth: 2,
    select: { profile: true, profileType: true },
  });

  const user = fetchedUser || auth.user;
  const profile = user?.profile;
  const profileID = profile?.value && extractID(profile.value);

  const headerTitle = useMemo(() => {
    return hasUser
      ? isAuthenticatedUser
        ? `My ${formatKebabToTitle(SLUG)}`
        : (fetchedUser && extractName(fetchedUser) + `'s ${formatKebabToTitle(SLUG)}`) ||
          formatKebabToTitle(SLUG)
      : `Available ${formatKebabToTitle(SLUG)}`;
  }, [hasUser, isAuthenticatedUser, fetchedUser]);

  const { where, slug } = useMemo(() => {
    let where: Where | undefined = undefined;
    let slug: CollectionSlug = SLUG;

    if (hasUser && profile && profileID) {
      const and: Where[] = [];
      and.push({ status: { equals: route.key } });
      switch (profile.relationTo) {
        case 'individuals': {
          and.push({ donor: { equals: profileID } });
          break;
        }
        default:
          break;
      }
      where = { and };
    } else {
      switch (route.key) {
        case 'individuals': {
          where = {
            status: {
              in: [DONATION_STATUS.AVAILABLE.value, DONATION_STATUS.PARTIALLY_ALLOCATED.value],
            },
          };
          break;
        }
        default:
          slug = route.key as CollectionSlug;
          break;
      }
    }

    return { where, slug };
  }, [hasUser, profile, profileID, route.key]);

  const Item = useCallback<FC<InfiniteListItemProps>>(
    ({ item, isLoading }) => {
      switch (slug) {
        case 'hospitals':
          return null;
        case 'milkBanks':
          return null;
        default:
          return <DonationListCard data={item as DataType} isLoading={isLoading} />;
      }
    },
    [slug]
  );

  return (
    <Box className="flex-1" style={{ marginBottom: insets.bottom }}>
      <Stack.Screen options={{ headerTitle }} />
      <InfiniteList
        slug={slug}
        isLoading={isLoading}
        isFetching={isFetching}
        fetchOptions={{ where }}
        ItemComponent={Item}
        estimatedItemSize={120}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
        onScrollBeginDrag={({ nativeEvent }) => onScrollBeginDrag(nativeEvent)}
        onScrollEndDrag={({ nativeEvent }) => onScrollEndDrag(nativeEvent)}
      />
    </Box>
  );
}
// #endregion
