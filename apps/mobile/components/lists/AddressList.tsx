import React, { FC } from 'react';

import { AnimatedPressable } from '@/components/animated/pressable';
import { Box } from '@/components/ui/box';
import { useRouter } from 'expo-router';
import { GestureResponderEvent } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { EditActionButton } from '../buttons';
import { AddressCard } from '../cards/AddressCard';
import { Divider } from '../ui/divider';
import { BasicList, BasicListItemProps, BasicListProps } from './BasicList';

const AnimatedAddressCard = Animated.createAnimatedComponent(AddressCard);

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
        <AnimatedAddressCard
          variant={itemVariant === 'card' ? 'filled' : 'ghost'}
          isLoading={isLoading}
          data={item}
          showMap={showMap}
          className={itemVariant === 'card' ? (showMap ? 'p-0' : undefined) : 'p-0'}
          action={<Action />}
          entering={FadeIn}
          exiting={FadeOut}
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
          >
            <Card />
          </AnimatedPressable>
        );

      case 'default':
      default:
        return <Card />;
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
