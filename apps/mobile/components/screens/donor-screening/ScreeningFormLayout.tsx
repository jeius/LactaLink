import { AnimatedProgress } from '@/components/animated/progress';
import { Form } from '@/components/contexts/FormProvider';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import FormNavigationProvider, {
  useFormNavigation,
} from '@/features/donor-screening/components/contexts/FormNavigationProvider';
import {
  usePublishSubmissionMutation,
  useSaveDraftSubmissionMutation,
} from '@/features/donor-screening/hooks/mutations';
import { useScreeningForm } from '@/features/donor-screening/hooks/useScreeningForm';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { DonorScreeningForm } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { Stack, useGlobalSearchParams, useRouter } from 'expo-router';
import { ArrowLeftIcon } from 'lucide-react-native';
import { useCallback } from 'react';
import { useFormState } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

export default function ScreeningFormLayout() {
  const insets = useSafeAreaInsets();
  const screenOptions = useScreenOptions({ animationType: 'slide' });
  const { sectionId } = useGlobalSearchParams<{ sectionId?: string }>();
  const router = useRouter();

  const methods = useScreeningForm();
  const { reset, getValues, control } = methods;
  const extraData = methods.extraData as { form: DonorScreeningForm | undefined };

  const formState = useFormState({ control });
  const { isDirty } = formState;

  const { mutateAsync: saveDraft, isPending: isSaving } = useSaveDraftSubmissionMutation(
    extraData.form?.id || ''
  );

  const { mutateAsync: publishSubmission, isPending: isPublishing } = usePublishSubmissionMutation(
    extraData.form?.id
  );

  const handleSave = useCallback(async () => {
    if (!isDirty) return;
    const values = getValues();
    await saveDraft(values);
    reset(values);
  }, [isDirty, getValues, reset, saveDraft]);

  const handleLeave = useCallback(() => {
    reset();
  }, [reset]);

  const handleSubmit = useCallback(async () => {
    const toastID = 'publish-submission';
    toast.loading('Submitting...', { id: toastID, duration: Infinity, cancel: null });
    await publishSubmission().then(
      () => {
        toast.success('Screening submitted!', { id: toastID });
        router.dismissTo('/donor-screening');
      },
      (error) => {
        toast.error('Failed to submit. ' + extractErrorMessage(error), { id: toastID });
      }
    );
  }, [publishSubmission, router]);

  return (
    <Form {...methods}>
      <FormNavigationProvider
        formState={formState}
        sectionID={sectionId}
        onSave={handleSave}
        onLeave={handleLeave}
      >
        <Stack screenOptions={{ ...screenOptions }}>
          <Stack.Screen
            name="index"
            options={{
              headerShown: true,
              header: () => (
                <Box className="items-start px-5" style={{ marginTop: insets.top }}>
                  <HeaderBackButton className="-ml-2" />
                </Box>
              ),
            }}
          />

          <Stack.Screen
            name="(pages)"
            options={{
              headerShown: true,
              header: () => (
                <FormHeader isDirty={isDirty} isSaving={isSaving} onSave={handleSave} />
              ),
            }}
          />

          <Stack.Screen
            name="summary"
            options={{
              headerShown: true,
              title: 'Summary',
              headerRight: () => (
                <Button
                  disablePressAnimation
                  className="w-fit px-2"
                  isDisabled={isPublishing}
                  onPress={handleSubmit}
                >
                  <ButtonText>Submit</ButtonText>
                </Button>
              ),
            }}
          />
        </Stack>
      </FormNavigationProvider>
    </Form>
  );
}

function FormHeader({
  isDirty,
  isSaving,
  onSave,
}: {
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { goBack, progress } = useFormNavigation((s) => ({
    goBack: s.goBack,
    progress: s.progress,
  }));
  return (
    <Box className="px-5" style={{ marginTop: insets.top }}>
      <AnimatedProgress size="sm" value={progress ?? 0} hidden={progress === undefined} />
      <HStack space="md" className="mt-1 items-center justify-between">
        <Button
          variant="ghost"
          action="default"
          onPress={goBack}
          className="-ml-2 h-fit w-fit rounded-full p-2"
          pointerEvents={isSaving ? 'none' : 'auto'}
        >
          <ButtonIcon as={ArrowLeftIcon} style={{ width: 24, height: 24 }} />
        </Button>

        <Button
          disablePressAnimation
          variant="ghost"
          isDisabled={!isDirty}
          onPress={onSave}
          pointerEvents={isSaving ? 'none' : 'auto'}
        >
          {isSaving && <ButtonSpinner />}
          <ButtonText>{isSaving ? 'Saving..' : 'Save'}</ButtonText>
        </Button>
      </HStack>
    </Box>
  );
}
