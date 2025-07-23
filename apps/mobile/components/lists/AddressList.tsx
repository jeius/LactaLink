import React, { FC } from 'react';

import { AnimatedPressable } from '@/components/animated/pressable';
import { Box } from '@/components/ui/box';
import { useRevalidateQueries } from '@/hooks/collections/useRevalidateQueries';
import { deleteCollection } from '@/lib/api/delete';
import { Motion } from '@legendapp/motion';
import { useRouter } from 'expo-router';
import { EditIcon, Trash2Icon } from 'lucide-react-native';
import { GestureResponderEvent } from 'react-native';
import { AddressCard } from '../cards/AddressCard';
import { ActionModal } from '../modals';
import { Button, ButtonIcon } from '../ui/button';
import { Divider } from '../ui/divider';
import { HStack } from '../ui/hstack';
import { Text } from '../ui/text';
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
  const revalidateQueries = useRevalidateQueries();

  const data = props.data;
  const isEmpty = Array.isArray(data) && data.length === 0;

  const ItemComponent: FC<BasicListItemProps<'addresses'>> = ({ item }) => {
    const isLoading = item.id.includes('placeholder');

    function handleEdit(e: GestureResponderEvent) {
      e.stopPropagation();
      router.push(`/addresses/edit/${item.id}`);
    }

    async function handleDelete() {
      if (!allowDelete) return;
      const deleted = await deleteCollection('addresses', item.id);
      if (deleted) {
        revalidateQueries();
      }
    }

    function Action() {
      return (
        (allowEdit || allowDelete) && (
          <HStack space="lg" className={`grow justify-end`}>
            {allowEdit && (
              <Button
                isDisabled={disableRemove}
                variant="link"
                action="default"
                className="h-fit w-fit p-0"
                hitSlop={8}
                onPress={handleEdit}
              >
                <ButtonIcon as={EditIcon} />
              </Button>
            )}

            {allowDelete && (
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
                title="Delete Address"
                description={
                  <Text>
                    Are you sure you want to delete
                    <Text className="font-JakartaSemiBold">{item.name ? ` ${item.name}` : ''}</Text>
                    ? This action cannot be undone.
                  </Text>
                }
              />
            )}
          </HStack>
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
              disableAnimation={!allowEdit || showMap}
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
      estimatedItemSize={220}
      ItemComponent={ItemComponent}
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
