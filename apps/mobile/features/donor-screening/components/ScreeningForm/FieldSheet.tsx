import { HeaderBackButton } from '@/components/HeaderBackButton';
import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import SafeArea from '@/components/SafeArea';
import { useForm } from '@/components/contexts/FormProvider';
import { LeaveToastAction } from '@/components/toasts/ToastAction';
import FormSheetHandle from '@/components/ui/FormSheetHandle';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStackProps } from '@/components/ui/vstack';
import { usePreventBackPress } from '@/hooks/usePreventBackPress';
import { DonorScreeningFormSchema } from '@lactalink/form-schemas';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { FieldArrayPath, UseFormStateReturn, useWatch } from 'react-hook-form';
import { GestureResponderEvent } from 'react-native';
import { toast } from 'sonner-native';
import { FIELD_OPTIONS } from '../../lib/constants';
import { BlockMethods, BlockSchema } from '../../lib/types';
import ScreeningFieldBlock from '../blocks/ScreeningFieldBlock';

interface Props extends VStackProps {
  name: FieldArrayPath<DonorScreeningFormSchema>;
}

export default function FieldSheet({ name }: Props) {
  const router = useRouter();
  const { control, setValue } = useForm<DonorScreeningFormSchema>();
  const blockRef = useRef<BlockMethods>(null);

  const block = useWatch({ control, name }) as BlockSchema | undefined;

  const blockLabel =
    (block && FIELD_OPTIONS.find((item) => item.value === block.blockType)?.label) || 'Field';

  const [isDirty, setIsDirty] = useState(false);

  usePreventBackPress(isDirty, showUnsavedWarning);

  const goBack = useCallback(
    (e: GestureResponderEvent) => {
      if (isDirty) {
        e.preventDefault();
        showUnsavedWarning();
      }
    },
    [isDirty]
  );

  const handleSubmit = useCallback(
    async (data: BlockSchema) => {
      //@ts-expect-error - ignore type issue since we know data is correct
      setValue(name, data, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
      setTimeout(() => {
        router.back();
      }, 100);
    },
    [setValue, name, router]
  );

  const handleFormStateChange = useCallback((state: UseFormStateReturn<BlockSchema>) => {
    setIsDirty(state.isDirty);
  }, []);

  if (!block) return null;

  return (
    <SafeArea safeTop={false} className="items-stretch justify-start">
      <FormSheetHandle />

      <HStack className="items-center gap-2 px-2 pb-1">
        <HeaderBackButton onPress={goBack} />
        <Text size="lg" bold className="flex-1">
          {blockLabel}
        </Text>
        {isDirty && (
          <Button variant="ghost" className="mr-2" onPress={() => blockRef.current?.reset()}>
            <ButtonText>Reset</ButtonText>
          </Button>
        )}
      </HStack>

      <KeyboardAvoidingScrollView className="flex-1" contentContainerClassName="p-4 grow">
        <ScreeningFieldBlock
          ref={blockRef}
          name={name}
          control={control}
          values={block}
          blockType={block.blockType}
          className="flex-1"
          defaultValues={block}
          onSubmit={handleSubmit}
          onFormStateChange={handleFormStateChange}
        />

        <Button className="mt-6" onPress={() => blockRef.current?.submit()}>
          <ButtonText>Save</ButtonText>
        </Button>
      </KeyboardAvoidingScrollView>
    </SafeArea>
  );
}

function showUnsavedWarning() {
  toast.warning('You have unsaved changes. Are you sure you want to go back?', {
    action: <LeaveToastAction />,
  });
}
