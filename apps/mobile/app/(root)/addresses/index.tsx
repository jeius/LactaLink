import { AddressList } from '@/components/lists';
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
  const { user: authUser, ...auth } = useAuth();

  const isAuthenticatedUser = authUser?.id === userID;

  const shouldFetch = Boolean(userID) && !isAuthenticatedUser;

  const {
    data: fetchedData,
    error,
    ...fetched
  } = useFetchById(shouldFetch, {
    collection: 'users',
    id: userID,
    select: { addresses: true },
  });

  const isLoading = fetched.isLoading || auth.isLoading;
  const isFetching = fetched.isFetching || auth.isFetching;
  const isRefreshing = shouldFetch ? fetched.isRefetching : auth.isRefetching;

  const data = userID
    ? isAuthenticatedUser
      ? authUser?.addresses?.docs || []
      : extractCollection(fetchedData?.addresses?.docs) || []
    : authUser?.addresses?.docs || [];

  function handleAddAddress() {
    router.push('/addresses/create');
  }

  function handleRefresh() {
    if (shouldFetch) {
      fetched.refetch();
    } else {
      auth.refetchUser();
    }
  }

  return (
    <SafeArea safeTop={false} safeBottom={false}>
      <VStack className="w-full flex-1">
        <AddressList
          data={data}
          allowDelete={isAuthenticatedUser || !userID}
          allowEdit={isAuthenticatedUser || !userID}
          isLoading={isLoading}
          isFetching={isFetching}
          showMap
          itemVariant="card"
          gap={16}
          refreshing={!isLoading && isRefreshing}
          onRefresh={handleRefresh}
        />

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
