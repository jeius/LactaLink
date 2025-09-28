import { AddressList } from '@/components/lists';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { extractName } from '@lactalink/utilities/extractors';
import { Motion } from '@legendapp/motion';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddressListPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { userID } = useLocalSearchParams<{ userID?: string }>();
  const { data: authUser, ...meUser } = useMeUser();

  const isAuthenticatedUser = authUser?.id === userID;

  const shouldFetch = Boolean(userID) && !isAuthenticatedUser;

  const { data: fetchedData, ...fetched } = useFetchById(shouldFetch, {
    collection: 'users',
    id: userID || '',
    select: { addresses: true, profile: true },
  });

  const user = userID ? fetchedData : authUser;

  const isLoading = fetched.isLoading || meUser.isLoading;
  const isFetching = fetched.isFetching || meUser.isFetching;
  const isRefreshing = shouldFetch ? fetched.isRefetching : meUser.isRefetching;

  const data = (user && authUser?.addresses?.docs) || [];
  const headerTitle =
    isAuthenticatedUser || !userID
      ? 'My Addresses'
      : (user && extractName(user) + "'s Addresses") || undefined;

  function handleAddAddress() {
    router.push('/addresses/create');
  }

  function handleRefresh() {
    if (shouldFetch) {
      fetched.refetch();
    } else {
      meUser.refetch();
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle }} />
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
            refreshing={isRefreshing}
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
    </>
  );
}
