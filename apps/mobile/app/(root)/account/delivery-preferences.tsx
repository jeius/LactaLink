import { DeliveryPreferenceList } from '@/components/lists/DeliveryPreferenceList';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { extractName } from '@lactalink/utilities/extractors';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ListPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { userID } = useLocalSearchParams<{ userID?: string }>();
  const { data: meUser, ...meUserQuery } = useMeUser();

  const isAuthenticatedUser = meUser?.id === userID;

  const shouldFetch = Boolean(userID) && !isAuthenticatedUser;

  const {
    data: fetchedData,
    error,
    ...fetched
  } = useFetchById(shouldFetch, {
    collection: 'users',
    id: userID || '',
    select: { deliveryPreferences: true, profile: true },
  });

  const user = userID ? fetchedData : meUser;

  const isLoading = fetched.isLoading || meUserQuery.isLoading;
  const isFetching = fetched.isFetching || meUserQuery.isFetching;
  const isRefreshing = shouldFetch ? fetched.isRefetching : meUserQuery.isRefetching;

  const data = (user && user?.deliveryPreferences?.docs) || [];
  const headerTitle =
    isAuthenticatedUser || !userID
      ? 'My Delivery Preferences'
      : (user && extractName(user) + "'s Delivery Preferences") || undefined;

  function handleAddAddress() {
    router.push('/delivery-preferences/create');
  }

  function handleRefresh() {
    if (shouldFetch) {
      fetched.refetch();
    } else {
      meUserQuery.refetch();
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle }} />
      <SafeArea safeTop={false} safeBottom={false}>
        <VStack className="h-full w-full">
          <DeliveryPreferenceList
            data={data}
            allowEdit={true}
            isLoading={isLoading}
            isFetching={isFetching}
            itemVariant="card"
            gap={16}
            refreshing={!isLoading && isRefreshing}
            onRefresh={handleRefresh}
          />

          <Box
            className="rounded-t-2xl border border-outline-300 bg-background-0 p-4"
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            <Button onPress={handleAddAddress}>
              <ButtonIcon as={PlusIcon} />
              <ButtonText>New Delivery Preference</ButtonText>
            </Button>
          </Box>
        </VStack>
      </SafeArea>
    </>
  );
}
