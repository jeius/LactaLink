import { Address, Hospital, Individual, MilkBank, Where } from '@lactalink/types';
import React, { useEffect } from 'react';

import { AnimatedPressable } from '@/components/animated/pressable';
import { RefreshControl } from '@/components/RefreshControl';
import { Box } from '@/components/ui/box';
import { useAuth } from '@/hooks/auth/useAuth';
import { useFetchBySlug } from '@/hooks/collections/useFetchBySlug';
import { areStrings, extractCollection, extractID } from '@lactalink/utilities';
import { Motion } from '@legendapp/motion';
import { useRouter } from 'expo-router';
import { ListRenderItem } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { AddressCard } from '../cards/AddressCard';
import { Divider } from '../ui/divider';
import { ListEmpty } from './ListEmpty';

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
}: AddressListProps) {
  const { profile } = useAuth();
  const router = useRouter();

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

    function handleEditAddress() {
      router.push(`/addresses/edit/${item.id}`);
    }

    switch (itemVariant) {
      case 'card':
        return (
          <Motion.View initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <AnimatedPressable
              disableAnimation={!enableEdit}
              onPress={enableEdit ? handleEditAddress : undefined}
            >
              <AddressCard
                variant="filled"
                isLoading={isLoading}
                disableDelete={disableRemove}
                data={item}
                hideEdit={!enableEdit}
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
              className="p-4"
              isLoading={isLoading}
              disableDelete={disableRemove}
              data={item}
              hideEdit={!enableEdit}
              onEditPress={handleEditAddress}
            />
          </Motion.View>
        );
    }
  };

  function EmptyComponent() {
    return !isLoading && <ListEmpty title="No addresses found" />;
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
