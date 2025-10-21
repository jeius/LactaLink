import { Address } from '@lactalink/types/payload-generated-types';
import React from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { EditActionButton } from '../buttons';
import { AddressCard } from '../cards';
import { SelectBottomSheet, SelectBottomSheetProps, SelectItemProps } from './SelectBottomSheet';

type AddressSelectBottomSheetProps<
  TMultiple extends boolean,
  TValue extends string | Address,
> = Omit<
  SelectBottomSheetProps<TMultiple, 'addresses', TValue>,
  'slug' | 'ItemComponent' | 'estimatedItemSize'
>;

const AnimatedCard = Animated.createAnimatedComponent(AddressCard);

export function AddressSelectBottomSheet<
  TValue extends string | Address,
  TMultiple extends boolean = false,
>(props: AddressSelectBottomSheetProps<TMultiple, TValue>) {
  function Item({ item, isLoading, canEdit }: SelectItemProps<'addresses'>) {
    return (
      <AnimatedCard
        entering={FadeIn}
        exiting={FadeOut}
        showMap={false}
        data={item}
        variant="ghost"
        isLoading={isLoading}
        action={canEdit && <EditActionButton href={`/addresses/${item.id}/edit`} />}
      />
    );
  }

  return (
    <SelectBottomSheet
      {...props}
      slug="addresses"
      title={props.title || 'Select Address'}
      ItemComponent={Item}
    />
  );
}
