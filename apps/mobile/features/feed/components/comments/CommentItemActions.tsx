import { ActionModal } from '@/components/modals';
import {
  BottomSheet,
  BottomSheetBackdrop,
  BottomSheetContent,
  BottomSheetDragIndicator,
  BottomSheetItem,
  BottomSheetModalPortal,
} from '@/components/ui/bottom-sheet';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useMeUser } from '@/hooks/auth/useAuth';
import { Comment } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import {
  HeartIcon,
  LucideIcon,
  LucideProps,
  PenIcon,
  SendIcon,
  Trash2Icon,
} from 'lucide-react-native';
import React, { FC, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CommentAction = {
  label: string;
  icon: FC<LucideProps> | LucideIcon;
  action: () => void;
};

interface CommentItemActionsProps {
  comment: Comment;
  open: boolean;
  hasLiked?: boolean;
  setOpen: (open: boolean) => void;
  onReply?: () => void;
  onEdit?: () => void;
  onLike?: () => void;
  onDelete?: (comment: Comment) => void;
}

export default function CommentItemActions({
  comment,
  open,
  hasLiked = false,
  setOpen,
  onDelete = () => {},
  onEdit = () => {},
  onLike = () => {},
  onReply = () => {},
}: CommentItemActionsProps) {
  const { data: meUser } = useMeUser();
  const insets = useSafeAreaInsets();

  const isAuthor = isEqualProfiles(meUser?.profile, comment.author);

  const actions: CommentAction[] = [
    { label: hasLiked ? 'Unlike' : 'Like', icon: HeartIcon, action: onLike },
    { label: 'Reply', icon: SendIcon, action: onReply },
  ];

  if (isAuthor) {
    actions.push({ label: 'Edit', icon: PenIcon, action: onEdit });
  }

  const dismiss = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <BottomSheet open={open} setOpen={setOpen}>
      <BottomSheetModalPortal
        enableDynamicSizing
        handleComponent={BottomSheetDragIndicator}
        backdropComponent={BottomSheetBackdrop}
      >
        <BottomSheetContent
          className="flex-col items-stretch bg-background-0"
          style={{ paddingBottom: insets.bottom }}
        >
          {actions.map(({ label, icon, action }, idx) => (
            <BottomSheetItem key={`${label}-${idx}`} onPress={action}>
              <HStack space="md" className="items-center px-4 py-3">
                <Icon as={icon} />
                <Text className="font-JakartaMedium">{label}</Text>
              </HStack>
            </BottomSheetItem>
          ))}

          {isAuthor && (
            <>
              <Divider className="my-2" />
              <ActionModal
                title="Delete Comment"
                description="Are you sure you want to delete this comment? This action cannot be undone."
                className="mx-2"
                confirmLabel="Delete"
                action="negative"
                triggerLabel="Delete"
                triggerIcon={Trash2Icon}
                onConfirm={() => {
                  dismiss();
                  onDelete(comment);
                }}
              />
            </>
          )}
        </BottomSheetContent>
      </BottomSheetModalPortal>
    </BottomSheet>
  );
}
