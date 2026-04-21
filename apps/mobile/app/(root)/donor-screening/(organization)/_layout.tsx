import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import { ActionModal } from '@/components/modals';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ActionSheet } from '@/components/ui/sheet';
import { SheetRef } from '@/components/ui/sheet/Sheet';
import { useDeleteScreeningFormMutation } from '@/features/donor-screening/hooks/mutations';
import { useMyOrgScreeningForm } from '@/features/donor-screening/hooks/useMyOrgScreeningForm';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack, useRouter } from 'expo-router';
import { EllipsisVertical, PenIcon, Trash2Icon } from 'lucide-react-native';
import { useCallback, useRef } from 'react';
import { toast } from 'sonner-native';

export default function DonorScreeningLayout() {
  const screenOptions = useScreenOptions();

  const { form, ...formQuery } = useMyOrgScreeningForm({ _status: 'published' });
  const { form: draftForm, ...draftFormQuery } = useMyOrgScreeningForm({ isDraft: true });

  const isLoading = formQuery.isLoading || draftFormQuery.isLoading;
  const hasForm = !!form;

  if (isLoading) return <LoadingSpinner />;

  return (
    <Stack
      initialRouteName={hasForm ? '(tabs)' : 'index'}
      screenOptions={{ ...screenOptions, presentation: 'containedModal' }}
    >
      <Stack.Protected guard={hasForm}>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: true,
            headerTitle: form?.title || 'Screening Form',
            headerRight: ({ tintColor }) => (
              <ThreeDotsAction tintColor={tintColor} formID={form?.id} />
            ),
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!!draftForm}>
        <Stack.Screen name="form/[id]" />
      </Stack.Protected>
    </Stack>
  );
}

function ThreeDotsAction({
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
