import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Donation, Where } from '@lactalink/types';
import React, { useEffect } from 'react';

import { AnimatedPressable } from '@/components/animated/pressable';
import { Image } from '@/components/Image';
import { RefreshControl } from '@/components/RefreshControl';
import { Box } from '@/components/ui/box';
import { useAuth } from '@/hooks/auth/useAuth';
import { useFetchBySlug } from '@/hooks/collections/useFetchBySlug';
import { getImageAsset } from '@/lib/stores';
import { Motion } from '@legendapp/motion';
import { useRouter } from 'expo-router';
import { ListRenderItem } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { AddressCard } from '../cards/AddressCard';
import { Divider } from '../ui/divider';

interface DonationListProps {
  donationIDs?: string[];
  onChange?: (value: Donation[]) => void;
  disableRemove?: boolean;
  itemVariant?: 'default' | 'card';
}

export function DonationList({
  donationIDs,
  onChange,
  disableRemove,
  itemVariant = 'default',
}: DonationListProps) {
  const { user } = useAuth();
  const router = useRouter();

  const where: Where | undefined =
    donationIDs && donationIDs.length > 0
      ? { id: { in: donationIDs } }
      : user
        ? { owner: { equals: user?.id } }
        : undefined;

  const shouldFetch = (donationIDs && donationIDs.length > 0) || Boolean(user);
  const { data, isLoading, isFetching, error, refetch } = useFetchBySlug(shouldFetch, {
    collection: 'donations',
    where,
    depth: 0,
  });

  const placeholderData = Array.from({ length: 3 }, (_, index) => ({
    id: `placeholder-${index}`,
  })) as Donation[];

  useEffect(() => {
    if (data && data.length > 0) {
      onChange?.(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const renderItem: ListRenderItem<Donation> = ({ item }) => {
    const isLoading = item.id.includes('placeholder');

    function handleEditAddress() {
      router.push(`/donations/edit/${item.id}`);
    }

    switch (itemVariant) {
      case 'card':
        return (
          <Motion.View initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <AnimatedPressable onPress={handleEditAddress}>
              <AddressCard
                variant="filled"
                isLoading={isLoading}
                disableDelete={disableRemove}
                data={item}
                hideEdit
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
              onEditPress={handleEditAddress}
            />
          </Motion.View>
        );
    }
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
            No donations found
          </Text>
        </VStack>
      )
    );
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
        data={isLoading ? placeholderData : data || []}
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
