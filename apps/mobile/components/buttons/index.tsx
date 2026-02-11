import { useRevalidateCollectionQueries } from '@/hooks/collections/useRevalidateQueries';
import { deleteCollection } from '@/lib/api/delete';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { type Href, useRouter } from 'expo-router';
import { EditIcon, Trash2Icon } from 'lucide-react-native';
import React, { ComponentProps } from 'react';
import { GestureResponderEvent } from 'react-native';
import { ActionModal } from '../modals';
import { Icon } from '../ui/icon';
import { Pressable, PressableProps } from '../ui/pressable';
import { Text } from '../ui/text';

interface EditActionButtonProps extends PressableProps {
  href?: Href;
  isDisabled?: boolean;
}

export function EditActionButton({
  href,
  hitSlop = 8,
  isDisabled,
  ...props
}: EditActionButtonProps) {
  const router = useRouter();

  function handleEditPress(e: GestureResponderEvent) {
    props.onPress?.(e);
    e.stopPropagation();
    if (href) router.push(href);
  }

  return (
    <Pressable
      {...props}
      disabled={isDisabled || props.disabled}
      hitSlop={hitSlop}
      className="overflow-hidden rounded-md p-2"
      onPress={handleEditPress}
    >
      <Icon as={EditIcon} />
    </Pressable>
  );
}

interface DeleteActionButtonProps extends ComponentProps<typeof ActionModal> {
  slug: CollectionSlug;
  id: string;
  itemName?: string | null;
}

export function DeleteActionButton({ itemName, slug, id, ...props }: DeleteActionButtonProps) {
  const revalidateQueries = useRevalidateCollectionQueries();

  async function handleDelete() {
    const deleted = await deleteCollection(slug, id);
    if (deleted) {
      revalidateQueries([slug, 'users']);
    }
  }

  return (
    <ActionModal
      hitSlop={8}
      action="negative"
      variant="link"
      {...props}
      className="h-fit w-fit"
      triggerIcon={Trash2Icon}
      onTriggerPress={async (e) => {
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

export * from './BottomSheetActionButton';
export * from './FloatingActionButton';
