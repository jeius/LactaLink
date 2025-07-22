import { Address, Where } from '@lactalink/types';
import React, { useEffect, useMemo } from 'react';

import { AnimatedPressable } from '@/components/animated/pressable';
import { RefreshControl } from '@/components/RefreshControl';
import { Box } from '@/components/ui/box';
import { useFetchBySlug } from '@/hooks/collections/useFetchBySlug';
import { useRevalidateQueries } from '@/hooks/collections/useRevalidateQueries';
import { deleteCollection } from '@/lib/api/delete';
import { areStrings, extractCollection, extractID } from '@lactalink/utilities';
import { Motion } from '@legendapp/motion';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { EditIcon, Trash2Icon } from 'lucide-react-native';
import { GestureResponderEvent } from 'react-native';
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
  addresses: (string | Address)[];
  onChange?: (value: Address[]) => void;
  disableRemove?: boolean;
  itemVariant?: 'default' | 'card';
  allowEdit?: boolean;
  allowDelete?: boolean;
  isLoading?: boolean;
  isFetching?: boolean;
  showMap?: boolean;
  gap?: number;
}

export function AddressList({
  addresses,
  onChange,
  disableRemove,
  itemVariant = 'default',
  isLoading: isLoadingProp,
  isFetching: isFetchingProp,
  showMap,
  allowEdit = false,
  allowDelete = false,
  gap = 12,
}: AddressListProps) {
  const router = useRouter();
  const revalidateQueries = useRevalidateQueries();

  const shouldFetch = areStrings(addresses);

  const addressIDs = useMemo(
    () => (shouldFetch && extractID(addresses)) || [],
    [shouldFetch, addresses]
  );

  const where: Where | undefined = addressIDs.length > 0 ? { id: { in: addressIDs } } : undefined;

  const {
    data: fetchedData,
    isLoading: isLoadingData,
    isFetching: isFetchingData,
    error,
  } = useFetchBySlug(Boolean(addressIDs.length > 0), {
    collection: 'addresses',
    where,
    depth: 0,
  });

  const isLoading = isLoadingProp || isLoadingData;
  const isFetching = isFetchingProp || isFetchingData;

  const data = (shouldFetch ? fetchedData : extractCollection(addresses)) || [];

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
      if (!allowDelete) return;
      const deleted = await deleteCollection('addresses', item.id);
      if (deleted) {
        revalidateQueries();
      }
    }

    switch (itemVariant) {
      case 'card':
        return (
          <Motion.View initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <AnimatedPressable
              disableAnimation={!allowEdit || showMap}
              onPress={allowEdit && !showMap ? handleEdit : undefined}
            >
              <AddressCard
                variant="filled"
                isLoading={isLoading}
                data={item}
                showMap={showMap}
                className={showMap ? 'p-0' : undefined}
                action={
                  (allowEdit || allowDelete) && (
                    <HStack space="lg" className="grow justify-between">
                      {allowEdit && (
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
                      )}
                      {allowDelete && (
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
                      )}
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
                (allowEdit || allowDelete) && (
                  <HStack space="lg" className="grow justify-between">
                    {allowEdit && (
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
                    )}
                    {allowDelete && (
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
                    )}
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
        return <Box style={{ height: gap }} />;
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
      <FlashList
        data={isLoading ? placeholderData : data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={220}
        contentContainerStyle={{
          paddingBottom: 20,
          paddingTop: itemVariant === 'card' ? 16 : 0,
          paddingHorizontal: itemVariant === 'card' ? 16 : 0,
        }}
        style={{ flex: 1 }}
        ListEmptyComponent={EmptyComponent}
        ItemSeparatorComponent={SeparatorComponent}
        ListFooterComponent={FooterComponent}
        refreshControl={<RefreshControl refreshing={!isLoading && isFetching} />}
      />
    </Box>
  );
}
