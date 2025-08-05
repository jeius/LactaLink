import { BottomSheetActionButton } from '@/components/buttons';
import { RequestListCard } from '@/components/cards/RequestListCard';
import { InfiniteList, InfiniteListItemProps } from '@/components/lists/InfiniteList';
import SafeArea from '@/components/SafeArea';
import { Tab } from '@/components/tabs/Tab';
import { Box } from '@/components/ui/box';
import { useAuth } from '@/hooks/auth/useAuth';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { CollectionSlug, Request, Where } from '@lactalink/types';
import { extractID, formatKebabToTitle } from '@lactalink/utilities';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';
import { createContext, FC, useContext, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Route, SceneMap } from 'react-native-tab-view';

type DataType = Request;

const SLUG: CollectionSlug = 'requests';

const routes: Route[] = Object.values(DONATION_REQUEST_STATUS).map(({ label, value }) => ({
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
  route: Route;
  jumpTo: (key: string) => void;
}

function SceneRenderer({ route }: SceneRendererProps) {
  const { userID } = useLocalSearchParams<{ userID?: string }>();
  const auth = useAuth();

  const insets = useSafeAreaInsets();
  const { scrolledDown, setScrolledDown } = useScroll();
  const previousOffset = useRef(0);

  const { data, isLoading, error, isFetching } = useFetchById(Boolean(userID), {
    collection: 'users',
    id: userID,
    depth: 0,
    select: { profile: true },
  });

  const profile = data?.profile || { value: auth.profile, relationTo: auth.profileCollection };
  const profileID = profile?.value && extractID(profile.value);

  const where: Where[] = [{ status: { equals: route.key } }];

  switch (profile?.relationTo) {
    case 'individuals': {
      if (profileID) {
        where.push({ requester: { equals: profileID } });
      }
      break;
    }
    default:
      break;
  }

  const Item: FC<InfiniteListItemProps> = ({ item, isLoading }) => {
    return <RequestListCard data={item as DataType} isLoading={isLoading} />;
  };

  return (
    <Box className="flex-1" style={{ marginBottom: insets.bottom }}>
      <InfiniteList
        slug={SLUG}
        isLoading={isLoading}
        isFetching={isFetching}
        fetchOptions={{ where: { and: where } }}
        ItemComponent={Item}
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

  const isOwner = userID ? user?.id === userID : true;

  function handleCreateNew() {
    // @ts-expect-error This is a workaround for the router type issue
    router.push(`/${SLUG}/create`);
  }

  return (
    <SafeArea safeTop={false} safeBottom={false}>
      <ScrollContext.Provider value={{ scrolledDown, setScrolledDown }}>
        <Tab routes={routes} renderScene={renderScene} lazy />
        <BottomSheetActionButton
          show={isOwner && !scrolledDown}
          icon={PlusIcon}
          label={`Create New ${formatKebabToTitle(SLUG)}`}
          onPress={handleCreateNew}
        />
      </ScrollContext.Provider>
    </SafeArea>
  );
}
