import { BottomSheetActionButton } from '@/components/buttons';
import { DonationListCard } from '@/components/cards/DonationListCard';
import { InfiniteList, InfiniteListItemProps } from '@/components/lists/InfiniteList';
import SafeArea from '@/components/SafeArea';
import { Tab } from '@/components/tabs/Tab';
import { Box } from '@/components/ui/box';
import { useAuth } from '@/hooks/auth/useAuth';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { useLiveCollectionRevalidator } from '@/hooks/live-updates/useLiveCollectionRevalidator';
import { DONATION_STATUS } from '@lactalink/enums';
import { CollectionSlug, Donation, Where } from '@lactalink/types';
import { extractID, extractName, formatKebabToTitle } from '@lactalink/utilities';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';
import { createContext, FC, useContext, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Route, SceneMap } from 'react-native-tab-view';

type DataType = Donation;

const SLUG: CollectionSlug = 'donations';

const routes: Route[] = Object.values(DONATION_STATUS).map(({ label, value }) => ({
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
  route?: Route;
  jumpTo?: (key: string) => void;
}

function SceneRenderer({ route }: SceneRendererProps) {
  const { userID } = useLocalSearchParams<{ userID?: string }>();
  const auth = useAuth();

  const insets = useSafeAreaInsets();
  const { scrolledDown, setScrolledDown } = useScroll();
  const previousOffset = useRef(0);

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

  const headerTitle = hasUser
    ? isAuthenticatedUser
      ? `My ${formatKebabToTitle(SLUG)}`
      : (fetchedUser && extractName(fetchedUser) + `'s ${formatKebabToTitle(SLUG)}`) ||
        formatKebabToTitle(SLUG)
    : `Available ${formatKebabToTitle(SLUG)}`;

  const where: Where[] = [
    {
      status: hasUser
        ? { equals: route?.key }
        : { in: [DONATION_STATUS.AVAILABLE.value, DONATION_STATUS.PARTIALLY_ALLOCATED.value] },
    },
  ];

  if (hasUser) {
    switch (profile?.relationTo) {
      case 'individuals': {
        if (profileID) {
          where.push({ donor: { equals: profileID } });
        }
        break;
      }
      default:
        break;
    }
  }

  const Item: FC<InfiniteListItemProps> = ({ item, isLoading }) => {
    return <DonationListCard data={item as DataType} isLoading={isLoading} />;
  };

  return (
    <Box className="flex-1" style={{ marginBottom: insets.bottom }}>
      <Stack.Screen options={{ headerShadowVisible: !hasUser, headerTitle }} />
      <InfiniteList
        slug={SLUG}
        isLoading={isLoading}
        isFetching={isFetching}
        fetchOptions={{ where: { and: where } }}
        ItemComponent={Item}
        estimatedItemSize={120}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
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
  const router = useRouter();
  const { userID } = useLocalSearchParams<{ userID?: string }>();
  const { user } = useAuth();

  useLiveCollectionRevalidator(SLUG, ['UPDATE']);

  const hasUser = Boolean(userID);
  const isOwner = user?.id === userID;

  function handleCreateNew() {
    // @ts-expect-error This is a workaround for the router type issue
    router.push(`/${SLUG}/create`);
  }

  return (
    <>
      <SafeArea safeTop={false} safeBottom={false}>
        <ScrollContext.Provider value={{ scrolledDown, setScrolledDown }}>
          {hasUser ? <Tab routes={routes} renderScene={renderScene} lazy /> : <SceneRenderer />}
          <BottomSheetActionButton
            show={(isOwner && !scrolledDown) || !hasUser}
            icon={PlusIcon}
            label={`Create New ${formatKebabToTitle(SLUG)}`}
            onPress={handleCreateNew}
          />
        </ScrollContext.Provider>
      </SafeArea>
    </>
  );
}
