import { ActionModal } from '@/components/modals';
import { Divider } from '@/components/ui/divider';
import { ActionSheet } from '@/components/ui/sheet';
import { useMeUser } from '@/hooks/auth/useAuth';
import { Comment } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { HeartIcon, LucideIcon, LucideProps, SendIcon, Trash2Icon } from 'lucide-react-native';
import { FC, useCallback } from 'react';

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
  onLike = () => {},
  onReply = () => {},
}: CommentItemActionsProps) {
  const { data: meUser } = useMeUser();
  const isAuthor = isEqualProfiles(meUser?.profile, comment.author);

  const actions: CommentAction[] = [
    { label: hasLiked ? 'Unlike' : 'Like', icon: HeartIcon, action: onLike },
    { label: 'Reply', icon: SendIcon, action: onReply },
  ];

  const dismiss = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <ActionSheet open={open} setOpen={setOpen}>
      <ActionSheet.Content>
        {actions.map(({ label, icon, action }, idx) => (
          <ActionSheet.Item key={`${label}-${idx}`} onPress={action}>
            <ActionSheet.Icon as={icon} />
            <ActionSheet.ItemText className="font-JakartaMedium">{label}</ActionSheet.ItemText>
          </ActionSheet.Item>
        ))}

        {isAuthor && (
          <>
            <Divider className="my-2" />
            <ActionModal
              title="Delete Comment"
              description="Are you sure you want to delete this comment? This action cannot be undone."
              className="mx-2"
              action="negative"
              triggerButtonProps={{ label: 'Delete', icon: Trash2Icon }}
              confirmButtonProps={{ label: 'Delete' }}
              onConfirm={() => {
                dismiss();
                onDelete(comment);
              }}
            />
          </>
        )}
      </ActionSheet.Content>
    </ActionSheet>
  );
}
