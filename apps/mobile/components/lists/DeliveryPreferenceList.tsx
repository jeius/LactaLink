import { Text } from '@/components/ui/text';
import { DeliveryPreference, Where } from '@lactalink/types';
import React, { useEffect, useMemo } from 'react';

import { AnimatedPressable } from '@/components/animated/pressable';
import { RefreshControl } from '@/components/RefreshControl';
import { Box } from '@/components/ui/box';
import { useAuth } from '@/hooks/auth/useAuth';
import { useFetchBySlug } from '@/hooks/collections/useFetchBySlug';
import { deleteCollection } from '@/lib/api/delete';
import { COLLECTION_QUERY_KEY } from '@/lib/constants';
import { Motion } from '@legendapp/motion';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { EditIcon, Trash2Icon } from 'lucide-react-native';
import { ListRenderItem } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { DeliveryPreferenceCard } from '../cards';
import { ActionModal } from '../modals';
import { NoData } from '../NoData';
import { Button, ButtonIcon } from '../ui/button';
import { Divider } from '../ui/divider';
import { HStack } from '../ui/hstack';

const placeholderData = Array.from({ length: 3 }, (_, index) => ({
  id: `placeholder-${index}`,
})) as DeliveryPreference[];

interface DeliveryPreferencesListProps {
  deliveryPreferenceIDs?: string[];
  onChange?: (value: DeliveryPreference[]) => void;
  disableRemove?: boolean;
  itemVariant?: 'default' | 'card';
  userID?: string;
  enableEdit?: boolean;
}

export function DeliveryPreferenceList({
  deliveryPreferenceIDs: preferenceIDs,
  onChange,
  disableRemove,
  itemVariant = 'default',
  userID: userIDProp,
  enableEdit = false,
}: DeliveryPreferencesListProps) {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const userID = userIDProp || user?.id;

  const where: Where | undefined =
    preferenceIDs && preferenceIDs.length > 0
      ? { id: { in: preferenceIDs } }
      : userID
        ? { owner: { equals: userID } }
        : undefined;

  const shouldFetch = (preferenceIDs && preferenceIDs.length > 0) || Boolean(user);
  const {
    data: fetchedData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useFetchBySlug(shouldFetch, {
    collection: 'delivery-preferences',
    where,
    populate: {
      addresses: { displayName: true, coordinates: true, name: true },
      users: { email: true },
    },
    sort: 'createdAt',
  });

  const data = useMemo(() => fetchedData || [], [fetchedData]);
  const isEmpty = data.length === 0;

  useEffect(() => {
    onChange?.(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const renderItem: ListRenderItem<DeliveryPreference> = ({ item }) => {
    const isLoading = item.id.includes('placeholder');

    function handleEdit() {
      router.push(`/delivery-preferences/edit/${item.id}`);
    }

    async function handleDelete() {
      if (!item || !item.id) return;
      const deleted = await deleteCollection('delivery-preferences', item.id);
      if (deleted) {
        queryClient.invalidateQueries({ queryKey: COLLECTION_QUERY_KEY });
      }
    }

    switch (itemVariant) {
      case 'card':
        return (
          <Motion.View initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <AnimatedPressable
              disableAnimation={!enableEdit}
              onPress={enableEdit ? handleEdit : undefined}
            >
              <DeliveryPreferenceCard
                isLoading={isLoading}
                variant="filled"
                preference={item}
                action={
                  <HStack className="grow justify-end">
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
                      title="Delete Delivery Preference"
                      description={
                        <Text>
                          Are you sure you want to delete{' '}
                          <Text className="font-JakartaSemiBold">{item.name}</Text>? This action
                          cannot be undone.
                        </Text>
                      }
                    />
                  </HStack>
                }
              />
            </AnimatedPressable>
          </Motion.View>
        );

      case 'default':
      default:
        return (
          <Motion.View initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <DeliveryPreferenceCard
              isLoading={isLoading}
              variant="ghost"
              preference={item}
              action={
                <HStack space="lg" className="grow justify-between">
                  {enableEdit && (
                    <Button
                      action="default"
                      variant="link"
                      className="h-fit w-fit p-0"
                      onPress={handleEdit}
                      hitSlop={8}
                    >
                      <ButtonIcon as={EditIcon} />
                    </Button>
                  )}
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
                    title="Delete Delivery Preference"
                    description={
                      <Text>
                        Are you sure you want to delete{' '}
                        <Text className="font-JakartaSemiBold">{item.name}</Text>? This action
                        cannot be undone.
                      </Text>
                    }
                  />
                </HStack>
              }
            />
          </Motion.View>
        );
    }
  };

  function EmptyComponent() {
    return !isLoading && <NoData title="No delivery preferences found" />;
  }

  function SeparatorComponent() {
    switch (itemVariant) {
      case 'card':
        return <Box className="h-2" />;
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
          itemVariant === 'card' ? { paddingHorizontal: 20 } : {},
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
