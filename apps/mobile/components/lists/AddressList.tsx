import { Address, Hospital, Individual, MilkBank, Where } from '@lactalink/types';
import React, { useEffect } from 'react';

import { AnimatedPressable } from '@/components/animated/pressable';
import { RefreshControl } from '@/components/RefreshControl';
import { Box } from '@/components/ui/box';
import { useAuth } from '@/hooks/auth/useAuth';
import { useFetchBySlug } from '@/hooks/collections/useFetchBySlug';
import { deleteCollection } from '@/lib/api/delete';
import { COLLECTION_QUERY_KEY } from '@/lib/constants';
import { areStrings, extractCollection, extractID } from '@lactalink/utilities';
import { Motion } from '@legendapp/motion';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { EditIcon, Trash2Icon } from 'lucide-react-native';
import { GestureResponderEvent, ListRenderItem } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { AddressCard } from '../cards/AddressCard';
import { ActionModal } from '../modals';
import { NoData } from '../NoData';
import { Button, ButtonIcon } from '../ui/button';
import { Divider } from '../ui/divider';
import { HStack } from '../ui/hstack';
import { Text } from '../ui/text';

const placeholderData = Array.from({ length: 3 }, (_, index) => ({
  id: `placeholder-${index}`,
})) as Address[];

interface AddressListProps {
  addressIDs?: string[];
  onChange?: (value: Address[]) => void;
  disableRemove?: boolean;
  itemVariant?: 'default' | 'card';
  profile?: Individual | Hospital | MilkBank | null;
  enableEdit?: boolean;
  isLoading?: boolean;
  isFetching?: boolean;
  showMap?: boolean;
}

export function AddressList({
  addressIDs: addressIDsProp,
  onChange,
  disableRemove,
  itemVariant = 'default',
  profile: profileProp,
  enableEdit = false,
  isLoading: isLoadingProp,
  isFetching: isFetchingProp,
  showMap,
}: AddressListProps) {
  const { profile } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const profileAddresses = profileProp?.addresses || profile?.addresses;
  const shouldFetch = areStrings(profileAddresses);

  const addressIDs = addressIDsProp || (shouldFetch && extractID(profileAddresses!)) || [];

  const where: Where | undefined =
    addressIDs && addressIDs.length > 0 ? { id: { in: addressIDs } } : undefined;

  const {
    data: fetchedData,
    isLoading: isLoadingData,
    isFetching: isFetchingData,
    error,
    refetch,
  } = useFetchBySlug(Boolean(addressIDs.length > 0), {
    collection: 'addresses',
    where,
    depth: 0,
  });

  const isLoading = isLoadingProp || isLoadingData;
  const isFetching = isFetchingProp || isFetchingData;

  const data: Address[] = (shouldFetch ? fetchedData : extractCollection(profileAddresses)) || [];

  const isEmpty = Array.isArray(data) && data.length === 0;

  useEffect(() => {
    if (data && data.length > 0) {
      onChange?.(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const renderItem: ListRenderItem<Address> = ({ item }) => {
    const isLoading = item.id.includes('placeholder');

    function handleEdit(e: GestureResponderEvent) {
      e.stopPropagation();
      router.push(`/addresses/edit/${item.id}`);
    }

    async function handleDelete() {
      const deleted = await deleteCollection('addresses', item.id);
      if (deleted) {
        queryClient.invalidateQueries({ queryKey: COLLECTION_QUERY_KEY });
      }
    }

    switch (itemVariant) {
      case 'card':
        return (
          <Motion.View initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <AnimatedPressable
              disableAnimation={!enableEdit || showMap}
              onPress={enableEdit && !showMap ? handleEdit : undefined}
            >
              <AddressCard
                variant="filled"
                isLoading={isLoading}
                data={item}
                showMap={showMap}
                className={showMap ? 'p-0' : undefined}
                action={
                  enableEdit && (
                    <HStack space="lg" className="grow justify-between">
                      <Button
                        isDisabled={disableRemove}
                        variant="link"
                        action="default"
                        className="h-fit w-fit p-0"
                        hitSlop={8}
                        onPress={handleEdit}
                      >
                        <ButtonIcon as={EditIcon} />
                      </Button>
                      <ActionModal
                        action="negative"
                        variant="link"
                        className="h-fit w-fit"
                        hitSlop={8}
                        isDisabled={disableRemove}
                        triggerIcon={Trash2Icon}
                        onTriggerPress={(e) => e.stopPropagation()}
                        iconOnly
                        onConfirm={handleDelete}
                        confirmLabel="Delete"
                        title="Delete Address"
                        description={
                          <Text>
                            Are you sure you want to delete
                            <Text className="font-JakartaSemiBold">
                              {item.name ? ` ${item.name}` : ''}
                            </Text>
                            ? This action cannot be undone.
                          </Text>
                        }
                      />
                    </HStack>
                  )
                }
              />
            </AnimatedPressable>
          </Motion.View>
        );

      case 'default':
      default:
        return (
          <Motion.View initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AddressCard
              variant="ghost"
              className="p-0"
              isLoading={isLoading}
              data={item}
              showMap={showMap}
              action={
                enableEdit && (
                  <HStack space="lg" className="grow justify-between">
                    <Button
                      isDisabled={disableRemove}
                      variant="link"
                      action="default"
                      className="h-fit w-fit p-0"
                      hitSlop={8}
                      onPress={handleEdit}
                    >
                      <ButtonIcon as={EditIcon} />
                    </Button>
                    <ActionModal
                      action="negative"
                      variant="link"
                      className="h-fit w-fit"
                      hitSlop={8}
                      isDisabled={disableRemove}
                      triggerIcon={Trash2Icon}
                      onTriggerPress={(e) => e.stopPropagation()}
                      iconOnly
                      onConfirm={handleDelete}
                      confirmLabel="Delete"
                      title="Delete Address"
                      description={
                        <Text>
                          Are you sure you want to delete
                          <Text className="font-JakartaSemiBold">
                            {item.name ? ` ${item.name}` : ''}
                          </Text>
                          ? This action cannot be undone.
                        </Text>
                      }
                    />
                  </HStack>
                )
              }
            />
          </Motion.View>
        );
    }
  };

  function EmptyComponent() {
    return !isLoading && <NoData title="No addresses found" />;
  }

  function SeparatorComponent() {
    switch (itemVariant) {
      case 'card':
        return <Box className="h-3" />;
      case 'default':
      default:
        return <Divider />;
    }
  }

  function FooterComponent() {
    if (isEmpty) return null;

    switch (itemVariant) {
      case 'card':
        return null;
      case 'default':
      default:
        return <Divider />;
    }
  }

  return (
    <Box className="flex-1">
      <FlatList
        data={isLoading ? placeholderData : data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          { flexGrow: 1, paddingBottom: 20 },
          itemVariant === 'card' ? { paddingHorizontal: 16 } : {},
        ]}
        style={{ flex: 1 }}
        ListEmptyComponent={EmptyComponent}
        ItemSeparatorComponent={SeparatorComponent}
        ListFooterComponent={FooterComponent}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />
        }
      />
    </Box>
  );
}
