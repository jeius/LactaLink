import { ActionModal } from '@/components/modals';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { ActionSheet } from '@/components/ui/sheet';
import { VStack } from '@/components/ui/vstack';
import { Post } from '@lactalink/types/payload-generated-types';
import { EllipsisIcon, PenIcon, Trash2Icon } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { useDeletePostMutation } from '../../hooks/mutations';

export default function PostActionMenu({ post }: { post: Post }) {
  const [open, setOpen] = useState(false);

  const { mutateAsync: deletePost, isPending: isDeleting } = useDeletePostMutation(post.id);

  const handleDelete = useCallback(() => {
    deletePost().then(() => setOpen(false));
  }, [deletePost]);

  const handleEdit = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <ActionSheet open={open} setOpen={setOpen}>
      <ActionSheet.Trigger className="rounded-full p-2" hitSlop={8}>
        <ActionSheet.Icon as={EllipsisIcon} />
      </ActionSheet.Trigger>
      <ActionSheet.Content>
        <VStack space="sm" className="px-4 pb-2">
          <Button
            action="default"
            variant="ghost"
            isDisabled={isDeleting}
            disablePressAnimation
            onPress={handleEdit}
          >
            <ButtonIcon as={PenIcon} />
            <ButtonText>Edit Post</ButtonText>
          </Button>

          <ActionModal
            action="negative"
            title="Confirm Delete"
            description="Are you sure you want to delete this post? This action cannot be undone."
            triggerButtonProps={{
              label: 'Delete Post',
              icon: Trash2Icon,
              variant: 'ghost',
              disablePressAnimation: true,
              isLoading: isDeleting,
              isDisabled: isDeleting,
            }}
            confirmButtonProps={{ label: 'Delete' }}
            onConfirm={handleDelete}
          />
        </VStack>
      </ActionSheet.Content>
    </ActionSheet>
  );
}
