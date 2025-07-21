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
  const { user, profile: authProfile } = useAuth();

  const isOwner = userID ? user?.id === userID : true;

  const { data, isLoading, isFetching, error } = useFetchById(!isOwner, {
    collection: 'users',
    id: userID,
    select: { profile: true },
  });

  const profile = isOwner ? authProfile : extractCollection(data?.profile?.value);

  function handleAddAddress() {
    router.push('/addresses/create');
  }

  return (
    <SafeArea safeTop={false} safeBottom={false}>
      <VStack className="w-full flex-1">
        <AddressList
          profile={profile}
          enableEdit={isOwner}
          isLoading={isLoading}
          isFetching={isFetching}
        />

        {isOwner && (
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
