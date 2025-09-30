import React, { FC } from 'react';

import { Box } from '@/components/ui/box';
import { Motion } from '@legendapp/motion';
import { DeleteActionButton, EditActionButton } from '../buttons';
import { DeliveryPreferenceCard } from '../cards';
import { Divider } from '../ui/divider';
import { HStack } from '../ui/hstack';
import { BasicList, BasicListItemProps, BasicListProps } from './BasicList';

interface DeliveryPreferencesListProps
  extends Omit<BasicListProps<'delivery-preferences'>, 'slug' | 'ItemComponent'> {
  disableRemove?: boolean;
  itemVariant?: 'default' | 'card';
  allowEdit?: boolean;
  allowDelete?: boolean;
}

export function DeliveryPreferenceList({
  disableRemove,
  itemVariant = 'default',
  allowEdit = false,
  allowDelete = false,
  gap,
  ...props
}: DeliveryPreferencesListProps) {
  const data = props.data;
  const isEmpty = data.length === 0;

  const ItemComponent: FC<BasicListItemProps<'delivery-preferences'>> = ({ item, isLoading }) => {
    function Action() {
      return (
        (allowEdit || allowDelete) && (
          <HStack space="lg" className={`grow justify-end`}>
            {allowEdit && (
              <EditActionButton
                isDisabled={disableRemove}
                href={`/delivery-preferences/${item.id}/edit`}
              />
            )}

            {allowDelete && (
              <DeleteActionButton
                id={item.id}
                slug="delivery-preferences"
                itemName={item.name}
                isDisabled={disableRemove}
                title="Delete Delivery Preference"
              />
            )}
          </HStack>
        )
      );
    }

    function Card() {
      return (
        <DeliveryPreferenceCard
          isLoading={isLoading}
          variant={itemVariant === 'card' ? 'filled' : 'ghost'}
          preference={item}
          action={<Action />}
          appearance="list-item"
        />
      );
    }

    switch (itemVariant) {
      case 'card':
        return (
          <Motion.View initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card />
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
      slug="delivery-preferences"
      ItemComponent={ItemComponent}
      keyExtractor={(item) => item.id}
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
