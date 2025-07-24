import { useRevalidateQueries } from '@/hooks/collections/useRevalidateQueries';
import { deleteCollection } from '@/lib/api/delete';
import { CollectionSlug } from '@lactalink/types';
import { type Href, useRouter } from 'expo-router';
import { EditIcon, Trash2Icon } from 'lucide-react-native';
import React, { ComponentProps } from 'react';
import { GestureResponderEvent } from 'react-native';
import { ActionModal } from '../modals';
import { Button, ButtonIcon } from '../ui/button';
import { Text } from '../ui/text';

interface EditActionButtonProps extends ComponentProps<typeof Button> {
  href: Href;
}

export function EditActionButton({ href, ...props }: EditActionButtonProps) {
  const router = useRouter();

  function handleEditPress(e: GestureResponderEvent) {
    props.onPress?.(e);
    e.stopPropagation();
    router.push(href);
  }

  return (
    <Button
      hitSlop={8}
      {...props}
      variant="link"
      action="default"
      className="h-fit w-fit p-0"
      onPress={handleEditPress}
    >
      <ButtonIcon as={EditIcon} />
    </Button>
  );
}

interface DeleteActionButtonProps extends ComponentProps<typeof ActionModal> {
  slug: CollectionSlug;
  id: string;
  itemName?: string | null;
}

export function DeleteActionButton({ itemName, slug, id, ...props }: DeleteActionButtonProps) {
  const revalidateQueries = useRevalidateQueries();

  async function handleDelete() {
    const deleted = await deleteCollection(slug, id);
    if (deleted) {
      revalidateQueries();
    }
  }

  return (
    <ActionModal
      hitSlop={8}
      {...props}
      action="negative"
      variant="link"
      className="h-fit w-fit"
      triggerIcon={Trash2Icon}
      onTriggerPress={(e) => {
        e.stopPropagation();
        props.onTriggerPress?.(e);
      }}
      iconOnly
      onConfirm={handleDelete}
      confirmLabel="Delete"
      description={
        <Text>
          Are you sure you want to delete
          <Text className="font-JakartaSemiBold">{itemName ? ` ${itemName}` : ''}</Text>? This
          action cannot be undone.
        </Text>
      }
    />
  );
}

export * from './FloatingActionButton';
