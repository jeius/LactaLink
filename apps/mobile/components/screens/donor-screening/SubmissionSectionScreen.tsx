import { Form } from '@/components/contexts/FormProvider';
import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { FlashList } from '@/components/ui/FlashList';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useFormNavigation } from '@/features/donor-screening/components/contexts/FormNavigationProvider';
import FieldBlock from '@/features/donor-screening/components/FieldBlock';
import { useSubmissionFormSection } from '@/features/donor-screening/hooks/useSubmissionFormSection';
import { useIsFocused } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import debounce from 'lodash/debounce';
import { useCallback, useEffect } from 'react';
import { useFormState } from 'react-hook-form';
import { GestureResponderEvent } from 'react-native';

const AUTO_SAVE_DELAY = 3000; // 3 seconds after the last change

export default function SubmissionSectionScreen() {
  const { sectionId } = useLocalSearchParams<{ sectionId: string }>();
  const isFocused = useIsFocused();

  const { formMethods, fields, description, title } = useSubmissionFormSection({
    sectionID: sectionId,
  });
  const { control, isLoading, submit } = formMethods;
  const { isSubmitting, isDirty } = useFormState({ control });

  const { goNext, isLastSection, saveDraft } = useFormNavigation((s) => ({
    goNext: s.goNext,
    isLastSection: s.isLastSection,
    saveDraft: s.save,
  }));

  const handleProceed = useCallback(
    async (e: GestureResponderEvent) => {
      const isSuccess = await submit();
      if (isSuccess) {
        await saveDraft(e);
        goNext();
      }
    },
    [goNext, saveDraft, submit]
  );

  // Auto-save
  useEffect(() => {
    const autoSave = debounce(saveDraft, AUTO_SAVE_DELAY, { trailing: true });
    if (isFocused && isDirty) autoSave();
    else if (!isFocused) autoSave.flush();
    return () => autoSave.cancel();
  }, [saveDraft, isDirty, isFocused]);

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
            <Button size="lg" onPress={handleProceed} isDisabled={isSubmitting}>
              <ButtonText>{isLastSection ? 'Review' : 'Next'}</ButtonText>
            </Button>
          }
          renderItem={({ item }) => {
            if (item.blockType === 'message') {
              return null; // TODO: render message block
            }
            return <FieldBlock control={control} field={item} />;
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
