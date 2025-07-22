import { AddressList } from '@/components/lists';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/hooks/auth/useAuth';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { extractCollection } from '@lactalink/utilities';
import { Motion } from '@legendapp/motion';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ListPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { userID } = useLocalSearchParams<{ userID?: string }>();
  const { user, refetchUser } = useAuth();

  const isAuthenticatedUser = user?.id === userID;

  const shouldFetch = Boolean(userID) && !isAuthenticatedUser;

  const { data, isLoading, isFetching, error, refetch } = useFetchById(shouldFetch, {
    collection: 'users',
    id: userID,
    select: { profile: true },
  });

  const addresses = userID
    ? isAuthenticatedUser
      ? user?.addresses?.docs || []
      : extractCollection(data?.addresses?.docs) || []
    : user?.addresses?.docs || [];

  function handleAddAddress() {
    router.push('/addresses/create');
  }

  return (
    <SafeArea safeTop={false} safeBottom={false}>
      <VStack className="w-full flex-1">
        <Box className="grow">
          <AddressList
            addresses={addresses}
            allowDelete={isAuthenticatedUser || !userID}
            allowEdit={isAuthenticatedUser || !userID}
            isLoading={isLoading}
            isFetching={isFetching}
            showMap
            itemVariant="card"
            gap={16}
            refreshControl={(props) => (
              <RefreshControl
                refreshing={props.refreshing || (!isLoading && isFetching)}
                onRefresh={() => {
                  props.onRefresh?.();
                  refetchUser();
                  refetch();
                }}
              />
            )}
          />
        </Box>

        {(isAuthenticatedUser || !userID) && (
          <Motion.View
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'tween', duration: 100 }}
            style={{ width: '100%' }}
          >
            <Box
              className="border-outline-300 bg-background-0 rounded-t-2xl border p-4"
              style={{ paddingBottom: insets.bottom }}
            >
              <Button onPress={handleAddAddress}>
                <ButtonIcon as={PlusIcon} />
                <ButtonText>Add New Address</ButtonText>
              </Button>
            </Box>
          </Motion.View>
        )}
      </VStack>
    </SafeArea>
  );
}
