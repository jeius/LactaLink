import { Form } from '@/components/contexts/FormProvider';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import { ActionModal } from '@/components/modals/ActionModal';
import { LeaveToastAction } from '@/components/toasts/ToastAction';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { SheetRef } from '@/components/ui/sheet/Sheet';
import {
  useDeleteScreeningFormMutation,
  usePublishScreeningFormMutation,
  useSaveScreeningFormMutation,
} from '@/features/donor-screening/hooks/mutations';
import { useScreeningFormQuery } from '@/features/donor-screening/hooks/queries';
import { useScreeningForm } from '@/features/donor-screening/hooks/useScreeningForm';
import { usePreventBackPress } from '@/hooks/usePreventBackPress';
import { useScreenFormSheetOptions, useScreenOptions } from '@/hooks/useScreenOptions';
import { DonorScreeningFormSchema } from '@lactalink/form-schemas';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollTextIcon, Trash2Icon } from 'lucide-react-native';
import { useCallback, useRef } from 'react';
import { useFormState } from 'react-hook-form';
import { GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

export default function FormCreateLayout() {
  const screenOptions = useScreenOptions();
  const formSheetOptions = useScreenFormSheetOptions();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { id: formID } = useLocalSearchParams<{ id: string }>();
  const { data: form, isLoading } = useScreeningFormQuery(formID, true);

  const methods = useScreeningForm(form);
  const { handleSubmit } = methods;
  const { isDirty, isSubmitting } = useFormState({ control: methods.control });

  const {
    mutate: saveDraft,
    mutateAsync: saveDraftAsync,
    isPending: isSaving,
  } = useSaveScreeningFormMutation(form?.id);

  const { mutateAsync: publish } = usePublishScreeningFormMutation(form?.id);

  usePreventBackPress(isDirty, showUnsavedWarning);

  const handleBackPress = useCallback(
    (e: GestureResponderEvent) => {
      if (isDirty) {
        showUnsavedWarning();
        e.preventDefault();
      }
    },
    [isDirty]
  );

  const handleSave = () => {
    if (isSaving) return;
    const values = methods.getValues();
    saveDraft(values);
  };

  const handlePublish = async (data: DonorScreeningFormSchema) => {
    const toastID = 'publish-screening-form';
    toast.loading('Publishing form...', { id: toastID, cancel: null, duration: Infinity });

    await saveDraftAsync(data);

    publish().then(
      () => {
        toast.success('Form submitted successfully!', { id: toastID });
        if (router.canDismiss()) {
          router.dismissTo('/donor-screening/form');
        } else if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/donor-screening/form');
        }
      },
      () => {
        toast.error('Failed to submit form. Please try again.', { id: toastID });
      }
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Form {...methods}>
      <Stack initialRouteName="index" screenOptions={formSheetOptions}>
        <Stack.Screen
          name="index"
          options={{
            ...screenOptions,
            headerShown: true,
            header: () => (
              <HStack
                space="md"
                className="items-center px-2 pb-2"
                style={{ paddingTop: insets.top + 4 }}
              >
                <HeaderBackButton onPress={handleBackPress} />

                <HStack space="sm" className="flex-1 items-center justify-end">
                  <Button
                    className="flex-1"
                    isDisabled={isSubmitting}
                    onPress={handleSubmit(handlePublish)}
                  >
                    <ButtonIcon as={ScrollTextIcon} />
                    <ButtonText>Publish</ButtonText>
                  </Button>
                  <Button
                    variant="outline"
                    isDisabled={!isDirty}
                    pointerEvents={isSaving ? 'none' : 'auto'}
                    onPress={handleSave}
                  >
                    {isSaving && <ButtonSpinner />}
                    <ButtonText>{isSaving ? 'Saving...' : 'Save Draft'}</ButtonText>
                  </Button>

                  <DeleteAction formID={form?.id} />
                </HStack>
              </HStack>
            ),
          }}
        />
      </Stack>
    </Form>
  );
}

function DeleteAction({ formID }: { formID: string | null | undefined }) {
  const router = useRouter();
  const { mutateAsync: deleteForm } = useDeleteScreeningFormMutation(formID);

  const ref = useRef<SheetRef>(null);

  const handleDelete = useCallback(() => {
    const toastID = 'delete-screening-form';
    toast.loading('Deleting form...', { id: toastID, cancel: null, duration: Infinity });

    deleteForm().then(
      () => {
        toast.success('Form deleted successfully!', { id: toastID });
        router.replace('/donor-screening/form');
      },
      () => {
        toast.error('Failed to delete form. Please try again.', { id: toastID });
      }
    );

    ref.current?.dismiss();
  }, [deleteForm, router]);

  return (
    <ActionModal
      triggerButtonProps={{
        action: 'negative',
        variant: 'ghost',
        label: null,
        icon: Trash2Icon,
        disablePressAnimation: true,
        className: 'px-3',
      }}
      title="Confirm Delete"
      description="Are you sure you want to delete this form?"
      confirmButtonProps={{ label: 'Delete', action: 'negative' }}
      onConfirm={handleDelete}
    />
  );
}

function showUnsavedWarning() {
  toast.warning('You have unsaved changes. Are you sure you want to go back?', {
    action: <LeaveToastAction />,
  });
}
