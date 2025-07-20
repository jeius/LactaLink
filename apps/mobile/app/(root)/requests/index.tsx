import { RequestListCard } from '@/components/cards/RequestListCard';
import { InfiniteList } from '@/components/lists/InfiniteList';
import SafeArea from '@/components/SafeArea';
import { Tab } from '@/components/tabs/Tab';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth/useAuth';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { REQUEST_STATUS } from '@lactalink/enums';
import { Collection, CollectionSlug, Request, Where } from '@lactalink/types';
import { extractID, formatKebabToTitle } from '@lactalink/utilities';
import { AnimatePresence, Motion } from '@legendapp/motion';
import { ListRenderItem } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';
import { createContext, useContext, useRef, useState } from 'react';
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
        where.push({ donor: { equals: profileID } });
      }
      break;
    }
    default:
      break;
  }

  const renderItem: ListRenderItem<Collection> = ({ item }) => {
    const isLoading = item.id.includes('placeholder');
    return <RequestListCard data={item as ItemType} isLoading={isLoading} />;
  };

  return (
    <InfiniteList
      slug={SLUG}
      isLoading={isLoading}
      isFetching={isFetching}
      fetchOptions={{ where: { and: where } }}
      renderItem={renderItem}
      style={{ marginBottom: insets.bottom }}
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
  );
}

export default function ListPage() {
  const [scrolledDown, setScrolledDown] = useState(false);
  const insets = useSafeAreaInsets();
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
        <AnimatePresence>
          {isOwner && !scrolledDown && (
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
                <Button onPress={handleCreateNew}>
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
