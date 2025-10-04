import React, { FC } from 'react';

import { AnimatedPressable } from '@/components/animated/pressable';
import { Box } from '@/components/ui/box';
import { Motion } from '@legendapp/motion';
import { useRouter } from 'expo-router';
import { GestureResponderEvent } from 'react-native';
import { EditActionButton } from '../buttons';
import { AddressCard } from '../cards/AddressCard';
import { Divider } from '../ui/divider';
import { BasicList, BasicListItemProps, BasicListProps } from './BasicList';

interface AddressListProps extends Omit<BasicListProps<'addresses'>, 'slug' | 'ItemComponent'> {
  disableRemove?: boolean;
  itemVariant?: 'default' | 'card';
  allowEdit?: boolean;
  allowDelete?: boolean;
  showMap?: boolean;
}

export function AddressList({
  disableRemove,
  itemVariant = 'default',
  showMap,
  allowEdit = false,
  allowDelete = false,
  gap = 12,
  ...props
}: AddressListProps) {
  const router = useRouter();

  const data = props.data;
  const isEmpty = Array.isArray(data) && data.length === 0;

  const ItemComponent: FC<BasicListItemProps<'addresses'>> = ({ item, isLoading }) => {
    function handleEdit(e: GestureResponderEvent) {
      e.stopPropagation();
      router.push(`/addresses/${item.id}/edit`);
    }

    function Action() {
      return (
        allowEdit && (
          <EditActionButton isDisabled={disableRemove} href={`/addresses/${item.id}/edit`} />
        )
      );
    }

    function Card() {
      return (
        <AddressCard
          variant={itemVariant === 'card' ? 'filled' : 'ghost'}
          isLoading={isLoading}
          data={item}
          showMap={showMap}
          className={itemVariant === 'card' ? (showMap ? 'p-0' : undefined) : 'p-0'}
          action={<Action />}
        />
      );
    }

    switch (itemVariant) {
      case 'card':
        return (
          <Motion.View initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <AnimatedPressable
              className="overflow-hidden rounded-2xl"
              disableRipple={!allowEdit || showMap}
              disablePressAnimation={!allowEdit || showMap}
              onPress={allowEdit && !showMap ? handleEdit : undefined}
            >
              <Card />
            </AnimatedPressable>
          </Motion.View>
        );

      case 'default':
      default:
        return (
          <Motion.View initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card />
          </Motion.View>
        );
    }
  };

  function SeparatorComponent() {
    switch (itemVariant) {
      case 'card':
        return <Box style={{ height: gap }} />;
      case 'default':
      default:
        return <Divider style={{ paddingVertical: gap }} />;
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
    <BasicList
      {...props}
      slug="addresses"
      ItemComponent={ItemComponent}
      placeholderLength={5}
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
