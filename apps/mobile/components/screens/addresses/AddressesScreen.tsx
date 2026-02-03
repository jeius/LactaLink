import { AddressList } from '@/components/lists';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { useInfiniteAddresses } from '@/features/address/hooks/queries';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { extractName } from '@lactalink/utilities/extractors';
import { Motion } from '@legendapp/motion';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddressesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { userID } = useLocalSearchParams<{ userID?: string }>();
  const { data: meUser, ...meUserQuery } = useMeUser();

  const { data, isRefetching, ...addrQuery } = useInfiniteAddresses(userID || meUser);

  const isMeUser = meUser?.id === userID;

  const { data: fetchedUser, ...userQuery } = useFetchById(!!userID && !isMeUser, {
    collection: 'users',
    id: userID || '',
  });

  const user = userID ? fetchedUser : meUser;

  const headerTitle = isMeUser
    ? 'My Addresses'
    : `${user ? extractName(user) : 'User'}'s Addresses`;

  function handleAddAddress() {
    router.push('/addresses/create');
  }

  function handleRefresh() {
    addrQuery.refetch();
    meUserQuery.refetch();
    userQuery.refetch();
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle }} />
      <SafeArea className="items-stretch" safeTop={false} safeBottom={false}>
        <VStack className="flex-1">
          <AddressList
            {...addrQuery}
            data={data}
            allowDelete={isMeUser || !userID}
            allowEdit={isMeUser || !userID}
            showMap
            itemVariant="card"
            gap={16}
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            emptyListLabel="You have no addresses to show."
          />

          {(isMeUser || !userID) && (
            <Motion.View
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'tween', duration: 100 }}
            >
              <Box
                className="rounded-t-2xl border border-outline-300 bg-background-0 p-4"
                style={{ paddingBottom: Math.max(insets.bottom, 16) }}
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
