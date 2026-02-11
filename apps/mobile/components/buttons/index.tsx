import { useRevalidateCollectionQueries } from '@/hooks/collections/useRevalidateQueries';
import { deleteCollection } from '@/lib/api/delete';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { type Href, useRouter } from 'expo-router';
import { EditIcon, Trash2Icon } from 'lucide-react-native';
import React, { ComponentProps } from 'react';
import { GestureResponderEvent } from 'react-native';
import { ActionModal } from '../modals';
import { Icon } from '../ui/icon';
import { Pressable, PressableProps } from '../ui/pressable';
import { Text } from '../ui/text';

const baseButtonStyle = tva({
  base: 'h-fit w-fit',
});

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
  slug?: CollectionSlug;
  id?: string;
  itemName?: string | null;
  shouldRevalidate?: boolean;
}

export function DeleteActionButton({
  itemName,
  slug,
  id,
  className,
  shouldRevalidate: revalidate = true,
  ...props
}: DeleteActionButtonProps) {
  const revalidateQueries = useRevalidateCollectionQueries();

  async function handleDelete() {
    props.onConfirm?.();

    if (!slug || !id) return;
    const deleted = await deleteCollection(slug, id);
    if (deleted && revalidate) revalidateQueries(slug);
  }

  return (
    <ActionModal
      {...props}
      hitSlop={props.hitSlop ?? 8}
      action={props.action ?? 'negative'}
      variant={props.variant ?? 'link'}
      className={baseButtonStyle({ className })}
      triggerIcon={Trash2Icon}
      onTriggerPress={async (e) => {
        e.stopPropagation();
        props.onTriggerPress?.(e);
      }}
      iconOnly={props.iconOnly ?? true}
      onConfirm={handleDelete}
      confirmLabel="Delete"
      title={props.title ?? 'Confirm Delete'}
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
