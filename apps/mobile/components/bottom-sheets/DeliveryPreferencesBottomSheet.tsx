import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import React from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { EditActionButton } from '../buttons';
import { DeliveryPreferenceCard } from '../cards/DeliveryPreferenceCard';
import { SelectBottomSheet, SelectBottomSheetProps, SelectItemProps } from './SelectBottomSheet';

type DeliveryPreferencesBottomSheetProps<
  TMultiple extends boolean,
  TValue extends string | DeliveryPreference,
> = Omit<
  SelectBottomSheetProps<TMultiple, 'delivery-preferences', TValue>,
  'slug' | 'ItemComponent' | 'estimatedItemSize'
>;

const AnimatedDPCard = Animated.createAnimatedComponent(DeliveryPreferenceCard);

export function DeliveryPreferencesBottomSheet<
  TValue extends string | DeliveryPreference,
  TMultiple extends boolean = false,
>(props: DeliveryPreferencesBottomSheetProps<TMultiple, TValue>) {
  function Item({ item, isLoading, canEdit }: SelectItemProps<'delivery-preferences'>) {
    return (
      <AnimatedDPCard
        entering={FadeIn}
        exiting={FadeOut}
        preference={item}
        variant="ghost"
        isLoading={isLoading}
        action={canEdit && <EditActionButton href={`/delivery-preferences/${item.id}/edit`} />}
      />
    );
  }

  return (
    <SelectBottomSheet
      {...props}
      slug="delivery-preferences"
      title={props.title || 'Select Delivery Preference'}
      ItemComponent={Item}
    />
  );
}
