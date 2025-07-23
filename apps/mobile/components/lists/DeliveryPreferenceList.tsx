import { Text } from '@/components/ui/text';
import React, { FC } from 'react';

import { AnimatedPressable } from '@/components/animated/pressable';
import { Box } from '@/components/ui/box';
import { useRevalidateQueries } from '@/hooks/collections/useRevalidateQueries';
import { deleteCollection } from '@/lib/api/delete';
import { Motion } from '@legendapp/motion';
import { useRouter } from 'expo-router';
import { EditIcon, Trash2Icon } from 'lucide-react-native';
import { DeliveryPreferenceCard } from '../cards';
import { ActionModal } from '../modals';
import { Button, ButtonIcon } from '../ui/button';
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
  const router = useRouter();
  const revalidateQueries = useRevalidateQueries();

  const data = props.data;
  const isEmpty = data.length === 0;

  const ItemComponent: FC<BasicListItemProps<'delivery-preferences'>> = ({ item, isLoading }) => {
    function handleEdit() {
      router.push(`/delivery-preferences/edit/${item.id}`);
    }

    async function handleDelete() {
      if (!item || !item.id) return;
      const deleted = await deleteCollection('delivery-preferences', item.id);
      if (deleted) {
        revalidateQueries();
      }
    }

    function Action() {
      return (
        (allowDelete || allowEdit) && (
          <HStack space="lg" className="grow justify-end">
            {allowEdit && (
              <Button
                action="default"
                variant="link"
                className="h-fit w-fit p-0"
                onPress={handleEdit}
                hitSlop={8}
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
                title="Delete Delivery Preference"
                description={
                  <Text>
                    Are you sure you want to delete{' '}
                    <Text className="font-JakartaSemiBold">{item.name}</Text>? This action cannot be
                    undone.
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
        <DeliveryPreferenceCard
          isLoading={isLoading}
          variant={itemVariant === 'card' ? 'filled' : 'ghost'}
          preference={item}
          action={<Action />}
        />
      );
    }

    switch (itemVariant) {
      case 'card':
        return (
          <Motion.View initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <AnimatedPressable
              disableAnimation={!allowEdit}
              onPress={allowEdit ? handleEdit : undefined}
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
      slug="delivery-preferences"
      estimatedItemSize={170}
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
