import { ActionModal } from '@/components/modals';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ActionSheet } from '@/components/ui/sheet';
import { SheetRef } from '@/components/ui/sheet/Sheet';
import { useDeleteScreeningFormMutation } from '@/features/donor-screening/hooks/mutations';
import { useRouter } from 'expo-router';
import { EllipsisVertical, PenIcon, Trash2Icon } from 'lucide-react-native';
import { useCallback, useRef } from 'react';
import { toast } from 'sonner-native';

export default function ScreeningFormActionMenu({
  tintColor,
  formID,
}: {
  tintColor?: string;
  formID: string | null | undefined;
}) {
  const router = useRouter();

  const { mutateAsync: deleteForm } = useDeleteScreeningFormMutation(formID);

  const ref = useRef<SheetRef>(null);

  const handleDelete = useCallback(() => {
    const toastID = 'delete-screening-form';
    toast.loading('Deleting form...', { id: toastID, cancel: null, duration: Infinity });

    deleteForm().then(
      () => {
        toast.success('Form deleted successfully!', { id: toastID });
      },
      () => {
        toast.error('Failed to delete form. Please try again.', { id: toastID });
      }
    );

    ref.current?.dismiss();
  }, [deleteForm]);

  const handleEdit = useCallback(() => {
    if (!formID) return;
    router.push(`/donor-screening/form/${formID}`);
    ref.current?.dismiss();
  }, [formID, router]);

  return (
    <ActionSheet ref={ref}>
      <ActionSheet.Trigger className="rounded-full p-3">
        <Icon as={EllipsisVertical} color={tintColor} />
      </ActionSheet.Trigger>

      <ActionSheet.Content>
        <Button disablePressAnimation variant="ghost" action="default" onPress={handleEdit}>
          <ButtonIcon as={PenIcon} />
          <ButtonText>Edit Form</ButtonText>
        </Button>

        <ActionModal
          triggerButtonProps={{
            action: 'negative',
            variant: 'ghost',
            disablePressAnimation: true,
            label: 'Delete Permanently',
            icon: Trash2Icon,
          }}
          title="Confirm Delete"
          description="Are you sure you want to delete this form?"
          confirmButtonProps={{ label: 'Delete', action: 'negative' }}
          onConfirm={handleDelete}
        />
      </ActionSheet.Content>
    </ActionSheet>
  );
}
