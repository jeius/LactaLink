import { HeaderBackButton } from '@/components/HeaderBackButton';
import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import SafeArea from '@/components/SafeArea';
import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useCreateDraftScreeningFormMutation } from '@/features/donor-screening/hooks/mutations';
import { useMyOrgScreeningForm } from '@/features/donor-screening/hooks/useMyOrgScreeningForm';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { AlertCircleIcon, FileXIcon, RefreshCwIcon } from 'lucide-react-native';
import { useEffect } from 'react';

export default function FormCreateWithTemplate() {
  const { id: templateID } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { form: draftForm, ...draftFormQuery } = useMyOrgScreeningForm({ isDraft: true });

  const {
    mutateAsync: createDraftForm,
    isPending,
    isSuccess,
    error,
  } = useCreateDraftScreeningFormMutation();

  const isLoading = draftFormQuery.isLoading || isPending;

  useEffect(() => {
    if (isSuccess || draftForm) return;
    createDraftForm(templateID).then((newForm) => {
      router.replace(`/donor-screening/form/${newForm.id}`, { withAnchor: true });
    });
  }, [templateID, createDraftForm, router, isSuccess, draftForm]);

  if (isLoading) return <LoadingSpinner />;

  if (draftForm) {
    return <Redirect href={`/donor-screening/form/${draftForm.id}`} withAnchor />;
  }

  if (!error) return null;
  const errorMessage = extractErrorMessage(error);

  return (
    <SafeArea className="items-stretch justify-start">
      <HStack className="p-2">
        <HeaderBackButton />
      </HStack>
      <VStack space="xl" className="flex-1 items-center justify-center px-6">
        {/* Icon */}
        <Box className="rounded-full bg-error-50 p-6">
          <Icon as={FileXIcon} className="text-error-500" style={{ width: 48, height: 48 }} />
        </Box>

        {/* Title & description */}
        <VStack space="sm" className="items-center">
          <Heading size="xl" className="text-center">
            Failed to Load Template
          </Heading>
          <Text size="md" className="text-center text-typography-500">
            We couldn&apos;t copy the standard form to use as your template. You can try again or
            start from scratch.
          </Text>
        </VStack>

        {/* Error detail */}
        <Alert action="error" className="w-full rounded-2xl">
          <AlertIcon as={AlertCircleIcon} />
          <AlertText className="flex-1" size="sm">
            {errorMessage}
          </AlertText>
        </Alert>

        {/* Actions */}
        <VStack space="sm" className="w-full">
          <Button onPress={() => createDraftForm(templateID)}>
            <ButtonIcon as={RefreshCwIcon} />
            <ButtonText>Try Again</ButtonText>
          </Button>
          <Button variant="outline" onPress={() => router.back()}>
            <ButtonText>Go Back</ButtonText>
          </Button>
        </VStack>
      </VStack>
    </SafeArea>
  );
}
