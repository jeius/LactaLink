import { Button, ButtonIcon } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Address } from '@lactalink/types';
import { EditIcon, Trash2Icon } from 'lucide-react-native';
import React, { ComponentProps } from 'react';

import { BasicBadge } from '@/components/badges';
import BasicLocationPin from '@/components/icons/BasicLocationPin';
import { ActionModal } from '@/components/modals';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { deleteCollection } from '@/lib/api/delete';
import { COLLECTION_QUERY_KEY } from '@/lib/constants';
import { extractID } from '@lactalink/utilities';
import { useQueryClient } from '@tanstack/react-query';
import { GestureResponderEvent } from 'react-native';

interface AddressCardProps extends ComponentProps<typeof Card> {
  data: string | Address;
  isLoading?: boolean;
  onEditPress?: (data: Address) => void;
  onDeleted?: (data: Address) => void;
  hideDelete?: boolean;
  hideEdit?: boolean;
  disableDelete?: boolean;
  disableEdit?: boolean;
}

export function AddressCard({
  data: dataProp,
  isLoading: isLoadingProp,
  onEditPress,
  onDeleted,
  hideDelete = false,
  hideEdit = false,
  disableDelete = false,
  disableEdit = false,
  ...props
}: AddressCardProps) {
  const queryClient = useQueryClient();

  const { data, isLoading: isDataLoading } = useFetchById(typeof dataProp === 'string', {
    collection: 'addresses',
    id: extractID(dataProp),
    depth: 0,
  });

  const isLoading = isLoadingProp || isDataLoading;
  const { name, displayName, isDefault } = typeof dataProp === 'object' ? dataProp : data || {};

  function handleEdit(e: GestureResponderEvent) {
    e.stopPropagation();
    if (data) {
      onEditPress?.(data);
    }
  }

  async function handleDelete() {
    if (!data || !data.id) return;
    const deleted = await deleteCollection('addresses', data.id);
    if (deleted) {
      queryClient.invalidateQueries({ queryKey: COLLECTION_QUERY_KEY });
    }

    onDeleted?.(data);
  }

  if (isLoading) {
    return (
      <Card {...props}>
        <HStack space="sm" className="w-full items-start">
          <Icon as={BasicLocationPin} />
          <VStack space="xs" className="flex-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3" />
            <Skeleton className="h-3 w-32" />
          </VStack>
          <HStack space="lg">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-6" />
          </HStack>
        </HStack>
      </Card>
    );
  }

  return (
    <Card {...props}>
      <HStack space="sm" className="w-full items-start">
        <Icon as={BasicLocationPin} />
        <Box className="flex-1">
          <Text className="font-JakartaSemiBold">{name}</Text>
          <Text size="sm">{displayName}</Text>
        </Box>
        <VStack space="sm" className="items-end">
          <HStack space="xl">
            {!hideEdit && (
              <Button
                isDisabled={disableEdit}
                variant="link"
                action="default"
                className="h-fit w-fit p-0"
                hitSlop={8}
                onPress={handleEdit}
              >
                <ButtonIcon as={EditIcon} />
              </Button>
            )}
            {!hideDelete && (
              <ActionModal
                action="negative"
                variant="link"
                className="h-fit w-fit"
                hitSlop={8}
                isDisabled={disableDelete}
                triggerIcon={Trash2Icon}
                onTriggerPress={(e) => e.stopPropagation()}
                iconOnly
                onConfirm={handleDelete}
                confirmLabel="Delete"
                title="Delete Address"
                description={
                  <Text>
                    Are you sure you want to delete{' '}
                    <Text className="font-JakartaSemiBold">{name}</Text>? This action cannot be
                    undone.
                  </Text>
                }
              />
            )}
          </HStack>

          {isDefault && <BasicBadge size="sm" variant="outline" action="info" text="Default" />}
        </VStack>
      </HStack>
    </Card>
  );
}
