import { BasicBadge } from '@/components/badges';
import BasicLocationPin from '@/components/icons/BasicLocationPin';
import { Image } from '@/components/Image';
import { ActionModal } from '@/components/modals';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/hooks/auth/useAuth';
import { useFetchBySlug } from '@/hooks/collections/useFetchBySlug';
import { deleteCollection } from '@/lib/api/delete';
import { COLLECTION_QUERY_KEY } from '@/lib/constants';
import { getImageAsset } from '@/lib/stores';
import { Address } from '@lactalink/types';
import { Motion } from '@legendapp/motion';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { EditIcon, PlusIcon, Trash2Icon } from 'lucide-react-native';
import { ListRenderItem } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ListPage() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error, refetch } = useFetchBySlug(Boolean(user), {
    collection: 'addresses',
    where: user ? { owner: { equals: user.id } } : undefined,
    depth: 0,
  });

  const placeholderData = Array.from({ length: 3 }, (_, index) => ({
    id: `placeholder-${index}`,
    name: 'Loading...',
    displayName: 'Loading...',
  })) as Address[];

  const renderItem: ListRenderItem<Address> = ({ item }) => {
    const { name, displayName, isDefault } = item;

    const isLoading = item.id.includes('placeholder');

    function handleEditAddress() {
      router.push(`/addresses/edit/${item.id}`);
    }

    async function handleDeleteAddress() {
      const deleted = await deleteCollection('addresses', item.id);
      if (deleted) {
        queryClient.invalidateQueries({ queryKey: COLLECTION_QUERY_KEY });
      }
    }

    return isLoading ? (
      <ItemPlaceholder />
    ) : (
      <HStack space="sm" className="border-outline-300 w-full items-start border-b p-4">
        <Icon as={BasicLocationPin} />
        <Box className="flex-1">
          <Text className="font-JakartaSemiBold">{name}</Text>
          <Text size="sm">{displayName}</Text>
        </Box>
        <VStack space="sm" className="items-end">
          <HStack space="xl">
            <Button
              variant="link"
              action="default"
              className="h-fit w-fit p-0"
              hitSlop={8}
              onPress={handleEditAddress}
            >
              <ButtonIcon as={EditIcon} />
            </Button>
            <ActionModal
              action="negative"
              variant="link"
              className="h-fit w-fit"
              hitSlop={8}
              triggerIcon={Trash2Icon}
              iconOnly
              onConfirm={handleDeleteAddress}
              confirmLabel="Delete"
              title="Delete Address"
              description={
                <Text>
                  Are you sure you want to delete{' '}
                  <Text className="font-JakartaSemiBold">{name}</Text>? This action cannot be
                  undone.
                </Text>
              }
            />
          </HStack>

          {isDefault && <BasicBadge size="sm" variant="outline" action="info" text="Default" />}
        </VStack>
      </HStack>
    );
  };

  function EmptyComponent() {
    return (
      !isLoading && (
        <VStack space="xs" className="flex-1 items-center justify-center p-10">
          <Image
            alt="No Data"
            source={getImageAsset('noData')}
            style={{ width: '100%', aspectRatio: 1.75, marginBottom: 10 }}
            contentFit="contain"
          />
          <Text size="lg" className="font-JakartaSemiBold">
            No addresses found
          </Text>
          <Text className="text-typography-700">
            You can add your addresses by tapping the button below.
          </Text>
        </VStack>
      )
    );
  }

  function handleAddAddress() {
    router.push('/addresses/create');
  }

  return (
    <SafeArea safeTop={false} safeBottom={false}>
      <FlatList
        data={isLoading ? placeholderData : data || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerClassName="pt-1"
        contentContainerStyle={{ flex: 1 }}
        className="h-full w-full"
        ListEmptyComponent={EmptyComponent}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />
        }
      />
      {!isLoading && (
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
    </SafeArea>
  );
}

function ItemPlaceholder() {
  return (
    <HStack space="sm" className="border-outline-300 items-start border-b p-4">
      <Icon as={BasicLocationPin} />
      <VStack space="xs" className="flex-1">
        <Skeleton variant="sharp" className="h-5 w-24" />
        <Skeleton variant="sharp" className="h-3" />
        <Skeleton variant="sharp" className="h-3 w-32" />
      </VStack>
      <HStack>
        <Button variant="link" action="default" className="h-fit w-fit">
          <ButtonIcon as={EditIcon} />
        </Button>
        <Button variant="link" action="negative" className="h-fit w-fit">
          <ButtonIcon as={Trash2Icon} />
        </Button>
      </HStack>
    </HStack>
  );
}
