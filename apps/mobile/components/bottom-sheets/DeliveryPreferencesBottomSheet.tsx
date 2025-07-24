import { Motion } from '@legendapp/motion';
import React from 'react';
import { EditActionButton } from '../buttons';
import { DeliveryPreferenceCard } from '../cards/DeliveryPreferenceCard';
import { SelectBottomSheet, SelectBottomSheetProps, SelectItemProps } from './SelectBottomSheet';

type DeliveryPreferencesBottomSheetProps<TMultiple extends boolean = false> = Omit<
  SelectBottomSheetProps<TMultiple, 'delivery-preferences'>,
  'slug' | 'ItemComponent' | 'estimatedItemSize'
>;

export function DeliveryPreferencesBottomSheet<TMultiple extends boolean = false>(
  props: DeliveryPreferencesBottomSheetProps<TMultiple>
) {
  function Item({ item, isLoading, canEdit }: SelectItemProps<'delivery-preferences'>) {
    return (
      <Motion.View initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <DeliveryPreferenceCard
          preference={item}
          variant="ghost"
          isLoading={isLoading}
          action={canEdit && <EditActionButton href={`/delivery-preferences/edit/${item.id}`} />}
        />
      </Motion.View>
    );
  }

  return (
    <SelectBottomSheet
      {...props}
      slug="delivery-preferences"
      title={props.title || 'Select Delivery Preference'}
      ItemComponent={Item}
      estimatedItemSize={150}
    />
  );
}
