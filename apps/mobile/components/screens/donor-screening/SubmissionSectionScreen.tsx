import { Form } from '@/components/contexts/FormProvider';
import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { FlashList } from '@/components/ui/FlashList';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import SubmissionFieldBlock from '@/features/donor-screening/components/blocks/SubmissionFieldBlock';
import { useFormNavigation } from '@/features/donor-screening/components/contexts/FormNavigationProvider';
import { useSubmissionFormSection } from '@/features/donor-screening/hooks/useSubmissionFormSection';
import { useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';

export default function SubmissionSectionScreen() {
  const { sectionId } = useLocalSearchParams<{ sectionId: string }>();

  const { formMethods, fields, description, title } = useSubmissionFormSection({
    sectionID: sectionId,
  });
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
    <SafeArea safeTop={false} className="items-stretch">
      <Form {...formMethods}>
        <FlashList
          data={fields}
          renderScrollComponent={KeyboardAvoidingScrollView}
          contentContainerClassName="p-4 grow"
          headerClassName="mb-6"
          footerClassName="justify-end mt-6 flex-1"
          ListHeaderComponent={<ListHeader title={title} description={description} />}
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
    </SafeArea>
  );
}

function ListHeader({ title, description }: { title?: string; description?: string | null }) {
  if (!title) return null;

  return (
    <VStack space="sm">
      <Text bold size="2xl">
        {title}
      </Text>
      {description && <Text>{description}</Text>}
    </VStack>
  );
}
