import React, { useCallback } from 'react';

import { AnimatedPressable } from '@/components/animated/pressable';
import { Box } from '@/components/ui/box';
import { useNavigateWithRedirect } from '@/hooks/useNavigateWithRedirect';
import { shadow } from '@/lib/utils/shadows';
import { Address } from '@lactalink/types/payload-generated-types';
import { ListRenderItem } from '@shopify/flash-list';
import { Href } from 'expo-router';
import { EditActionButton } from '../buttons';
import { AddressCard } from '../cards/AddressCard';
import { Divider } from '../ui/divider';
import { VerticalInfiniteList, VerticalInfiniteListProps } from '../ui/list/vertical-list';
import { Skeleton } from '../ui/skeleton';

interface AddressListProps extends Omit<VerticalInfiniteListProps<Address>, 'renderItem'> {
  disableRemove?: boolean;
  itemVariant?: 'default' | 'card';
  allowEdit?: boolean;
  allowDelete?: boolean;
  showMap?: boolean;
  isLoading?: boolean;
}

export function AddressList({
  disableRemove,
  itemVariant = 'default',
  showMap,
  allowEdit = false,
  allowDelete = false,
  gap = 12,
  isLoading = false,
  ...props
}: AddressListProps) {
  const navigateTo = useNavigateWithRedirect();

  const data = props.data;
  const isEmpty = Array.isArray(data) && data.length === 0;

  const renderItem = useCallback<ListRenderItem<Address>>(
    ({ item }) => {
      if (isLoading) return <Skeleton className="h-40" />;

      const href: Href = `/addresses/edit/${item.id}`;

      const handleEdit = () => navigateTo(href, 'push');

      function Card() {
        return (
          <AddressCard
            variant={itemVariant === 'card' ? 'filled' : 'ghost'}
            isLoading={isLoading}
            data={item}
            showMap={showMap}
            className={itemVariant === 'card' ? (showMap ? 'p-0' : undefined) : 'p-0'}
            action={
              allowEdit && <EditActionButton isDisabled={disableRemove} onPress={handleEdit} />
            }
          />
        );
      }

      switch (itemVariant) {
        case 'card':
          return (
            <AnimatedPressable
              className="overflow-hidden rounded-2xl"
              disableRipple={!allowEdit || showMap}
              disablePressAnimation={!allowEdit || showMap}
              onPress={allowEdit && !showMap ? handleEdit : undefined}
              style={shadow.sm}
            >
              <Card />
            </AnimatedPressable>
          );

        case 'default':
        default:
          return <Card />;
      }
    },
    [isLoading, itemVariant, navigateTo, showMap, allowEdit, disableRemove]
  );

  const SeparatorComponent = useCallback(() => {
    switch (itemVariant) {
      case 'card':
        return <Box style={{ height: gap }} />;
      case 'default':
      default:
        return <Divider style={{ paddingVertical: gap }} />;
    }
  }, [gap, itemVariant]);

  const FooterComponent = useCallback(() => {
    if (isEmpty) return null;
    switch (itemVariant) {
      case 'card':
        return null;
      case 'default':
      default:
        return <Divider />;
    }
  }, [isEmpty, itemVariant]);

  return (
    <VerticalInfiniteList
      {...props}
      renderItem={renderItem}
      ItemSeparatorComponent={SeparatorComponent}
      ListFooterComponent={FooterComponent}
      contentContainerStyle={{
        paddingBottom: 20,
        paddingTop: itemVariant === 'card' ? 16 : 0,
        paddingHorizontal: itemVariant === 'card' ? 16 : 0,
      }}
    />
  );
}
