import { useScroll } from '@/components/contexts/ScrollProvider';
import { InfiniteList } from '@/components/lists/InfiniteList';
import { Tab } from '@/components/tabs/Tab';
import { Box } from '@/components/ui/box';
import { useMeUser } from '@/hooks/auth/useAuth';
import {
  isStatusPendingOrAvailable,
  useDonationRequestCancelMutation,
} from '@/hooks/collections/useDonationRequestCancelMutation';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { INFINITE_QUERY_KEY } from '@/lib/constants';
import { getTimeStampWithLabel } from '@/lib/utils/getTimestampWithLabel';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { CollectionSlug, Where } from '@lactalink/types';
import { extractID, extractName, formatKebabToTitle } from '@lactalink/utilities';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Route, SceneMap } from 'react-native-tab-view';
import { EditActionButton } from '../buttons';
import { DonationListCard } from '../cards';
import { ActionModal } from '../modals';
import { Button, ButtonText } from '../ui/button';
import { HStack } from '../ui/hstack';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

const SLUG: Extract<CollectionSlug, 'donations'> = 'donations';

const routes = createTabRoutes();
const renderScene = createTabSceneMap(routes);

export function UserDonationsTab() {
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

  const queryKey = [...INFINITE_QUERY_KEY, SLUG, { where }];
  const actionMutation = useDonationRequestCancelMutation(queryKey, SLUG);

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
          const isStatusMatched = DONATION_REQUEST_STATUS.MATCHED.value === item.status;
          const timestamp = getTimeStampWithLabel(item);

          return (
            <DonationListCard
              data={item}
              showProgressBar={isStatusMatched}
              action={
                isOwner &&
                isStatusPendingOrAvailable(item.status) && (
                  <VStack className="flex-1 items-start">
                    <EditActionButton href={`/donations/edit/${item.id}`} />
                  </VStack>
                )
              }
              footerAction={
                <HStack space="sm" className="flex-1 items-center justify-end">
                  {!isStatusMatched && (
                    <VStack className="flex-1">
                      <Text size="xs" className="text-typography-700">
                        {timestamp?.label}
                      </Text>
                      <Text size="xs" className="text-typography-700">
                        {timestamp?.value}
                      </Text>
                    </VStack>
                  )}
                  {isStatusPendingOrAvailable(item.status) ? (
                    <ActionModal
                      size="xs"
                      variant="outline"
                      action="negative"
                      triggerLabel="Cancel"
                      title="Cancel Donation"
                      onConfirm={() => actionMutation.mutate(item)}
                      description={`Are you sure you want to cancel this donation? This action cannot be undone.`}
                    />
                  ) : (
                    <Button size="xs" variant="outline" action="default">
                      <ButtonText>View Details</ButtonText>
                    </Button>
                  )}
                </HStack>
              }
            />
          );
        }}
      />
    </Box>
  );
}
// #endregion
