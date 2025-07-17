import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Address, AddressSchema, Where } from '@lactalink/types';
import { EditIcon, PlusIcon, Trash2Icon } from 'lucide-react-native';
import React, { ComponentProps, useEffect } from 'react';

import { AnimatedPressable } from '@/components/animated/pressable';
import { BasicBadge } from '@/components/badges';
import BasicLocationPin from '@/components/icons/BasicLocationPin';
import { Image } from '@/components/Image';
import { ActionModal } from '@/components/modals';
import { RefreshControl } from '@/components/RefreshControl';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/auth/useAuth';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { useFetchBySlug } from '@/hooks/collections/useFetchBySlug';
import { deleteCollection } from '@/lib/api/delete';
import { COLLECTION_QUERY_KEY, MMKV_KEYS } from '@/lib/constants';
import { getImageAsset } from '@/lib/stores';
import { extractID } from '@lactalink/utilities';
import { Motion } from '@legendapp/motion';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Dimensions, GestureResponderEvent, ListRenderItem } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

const storageKey = MMKV_KEYS.SETUP_PROFILE.ADDRESS_COUNT;
const DEVICE_WIDTH = Dimensions.get('window').width;

interface AddressesCardProps extends ComponentProps<typeof Card> {
  addressIDs?: string[];
  onChange?: (value: AddressSchema[]) => void;
  disableRemove?: boolean;
}

export default function AddressesCard({
  addressIDs,
  onChange,
  disableRemove,
  ...props
}: AddressesCardProps) {
  const { user } = useAuth();
  const router = useRouter();

  const where: Where | undefined =
    addressIDs && addressIDs.length > 0
      ? { id: { in: addressIDs } }
      : user
        ? { owner: { equals: user?.id } }
        : undefined;

  const shouldFetch = (addressIDs && addressIDs.length > 0) || Boolean(user);
  const { data, isLoading, isFetching, error, refetch } = useFetchBySlug(shouldFetch, {
    collection: 'addresses',
    where,
    depth: 0,
  });

  useEffect(() => {
    if (data && data.length > 0) {
      const addresses: AddressSchema[] = data.map((address) => {
        const [latitude, longitude] = address.coordinates || [0, 0];
        return {
          id: address.id,
          province: extractID(address.province),
          cityMunicipality: extractID(address.cityMunicipality),
          barangay: address.barangay ? extractID(address.barangay) : undefined,
          street: address.street || '',
          zipCode: address.zipCode || '',
          name: address.name || '',
          displayName: address.displayName || '',
          isDefault: address.isDefault || false,
          coordinates: { latitude, longitude },
        };
      });
      onChange?.(addresses);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const renderItem: ListRenderItem<Address> = ({ item }) => {
    function handleEditAddress() {
      router.push(`/addresses/edit/${item.id}`);
    }

    return (
      <Motion.View initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <AnimatedPressable onPress={handleEditAddress}>
          <AddressCard disableDelete={disableRemove} data={item} hideEdit />
        </AnimatedPressable>
      </Motion.View>
    );
  };

  function EmptyComponent() {
    return (
      !isLoading && (
        <VStack space="xs" className="flex-1 items-center justify-center">
          <Image
            alt="No Data"
            source={getImageAsset('noData')}
            style={{ width: '75%', aspectRatio: 1.75, marginBottom: 10 }}
            contentFit="contain"
          />
          <Text size="lg" className="font-JakartaSemiBold">
            No addresses found
          </Text>
        </VStack>
      )
    );
  }

  function handleAdd() {
    router.push('/addresses/create');
  }

  return (
    <Card {...props}>
      <VStack className="flex-1 justify-start">
        {isLoading ? (
          <Box className="flex-1">
            <Spinner size={'large'} className="mx-auto mt-5" />
          </Box>
        ) : (
          <FlatList
            data={data || []}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ flexGrow: 1 }}
            style={{ flex: 1 }}
            ListEmptyComponent={EmptyComponent}
            ItemSeparatorComponent={() => <Box className="h-2" />}
            refreshControl={
              <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />
            }
          />
        )}

        <Button variant="outline" action="positive" onPress={handleAdd}>
          <ButtonIcon size="md" as={PlusIcon} />
          <ButtonText>Add New Address</ButtonText>
        </Button>
      </VStack>
    </Card>
  );
}

interface AddressCardProps extends ComponentProps<typeof Card> {
  data: string | Address;
  isLoading?: boolean;
  onEditPress?: (data: Address) => void;
  onDeleted?: (data: Address) => void;
  hideDelete?: boolean;
  hideEdit?: boolean;
  disableDelete?: boolean;
  disableEdit?: boolean;
}

export function AddressCard({
  data: dataProp,
  isLoading: isLoadingProp,
  onEditPress,
  onDeleted,
  hideDelete = false,
  hideEdit = false,
  disableDelete = false,
  disableEdit = false,
  ...props
}: AddressCardProps) {
  const queryClient = useQueryClient();

  const { data, isLoading: isDataLoading } = useFetchById(typeof dataProp === 'string', {
    collection: 'addresses',
    id: extractID(dataProp),
    depth: 0,
  });

  const isLoading = isLoadingProp || isDataLoading;
  const { name, displayName, isDefault } = typeof dataProp === 'object' ? dataProp : data || {};

  function handleEdit(e: GestureResponderEvent) {
    e.stopPropagation();
    if (data) {
      onEditPress?.(data);
    }
  }

  async function handleDelete() {
    if (!data || !data.id) return;
    const deleted = await deleteCollection('addresses', data.id);
    if (deleted) {
      queryClient.invalidateQueries({ queryKey: COLLECTION_QUERY_KEY });
    }

    onDeleted?.(data);
  }

  if (isLoading) {
    return (
      <Card {...props}>
        <HStack space="sm" className="w-full items-start">
          <Icon as={BasicLocationPin} />
          <VStack space="xs" className="flex-1">
            <Skeleton variant="sharp" className="h-5 w-24" />
            <Skeleton variant="sharp" className="h-3" />
            <Skeleton variant="sharp" className="h-3 w-32" />
          </VStack>
          <HStack space="xl">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-5" />
          </HStack>
        </HStack>
      </Card>
    );
  }

  return (
    <Card {...props}>
      <HStack space="sm" className="w-full items-start">
        <Icon as={BasicLocationPin} />
        <Box className="flex-1">
          <Text className="font-JakartaSemiBold">{name}</Text>
          <Text size="sm">{displayName}</Text>
        </Box>
        <VStack space="sm" className="items-end">
          <HStack space="xl">
            {!hideEdit && (
              <Button
                isDisabled={disableEdit}
                variant="link"
                action="default"
                className="h-fit w-fit p-0"
                hitSlop={8}
                onPress={handleEdit}
              >
                <ButtonIcon as={EditIcon} />
              </Button>
            )}
            {!hideDelete && (
              <ActionModal
                action="negative"
                variant="link"
                className="h-fit w-fit"
                hitSlop={8}
                isDisabled={disableDelete}
                triggerIcon={Trash2Icon}
                onTriggerPress={(e) => e.stopPropagation()}
                iconOnly
                onConfirm={handleDelete}
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
            )}
          </HStack>

          {isDefault && <BasicBadge size="sm" variant="outline" action="info" text="Default" />}
        </VStack>
      </HStack>
    </Card>
  );
}
