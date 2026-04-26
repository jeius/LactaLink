import { Form } from '@/components/contexts/FormProvider';
import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { FlashList } from '@/components/ui/FlashList';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import SubmissionFieldBlock from '@/features/donor-screening/components/blocks/SubmissionFieldBlock';
import { useFormNavigation } from '@/features/donor-screening/components/contexts/FormNavigationProvider';
import { useSubmissionFormRootFields } from '@/features/donor-screening/hooks/useSubmissionFormRootFields';
import { useCallback } from 'react';

export default function SubmissionRootFieldsScreen() {
  const { formMethods, fields, title } = useSubmissionFormRootFields();
  const { control, isLoading, handleSubmit } = formMethods;

  const { goNext, isLastSection, saveDraft, isSaving } = useFormNavigation((s) => ({
    goNext: s.goNext,
    isLastSection: s.isLastSection,
    saveDraft: s.save,
    isSaving: s.isSaving,
  }));

  const onSubmit = useCallback(async () => {
    await saveDraft();
    goNext();
  }, [goNext, saveDraft]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Form {...formMethods}>
      <FlashList
        data={fields ?? []}
        renderScrollComponent={KeyboardAvoidingScrollView}
        contentContainerClassName="p-4"
        ListHeaderComponent={title ? <ListHeader title={title} /> : null}
        ItemSeparatorComponent={() => <Box className="h-6" />}
        ListFooterComponent={
          <Button size="lg" onPress={handleSubmit(onSubmit)} isDisabled={isSaving}>
            <ButtonText>{isLastSection ? 'Review' : 'Next'}</ButtonText>
          </Button>
        }
        renderItem={({ item }) => {
          if (item.blockType === 'message') {
            return null; // TODO: render message block
          }
          return <SubmissionFieldBlock control={control} field={item} />;
        }}
      />
    </Form>
  );
}

function ListHeader({ title }: { title: string }) {
  return (
    <VStack space="lg">
      <Text bold size="2xl">
        {title}
      </Text>
    </VStack>
  );
}
